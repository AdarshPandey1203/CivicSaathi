import express, { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Gemini Client
const apiKey = process.env.GEMINI_API_KEY || '';
let genAI: GoogleGenAI | null = null;
if (apiKey) {
  try {
    genAI = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.error('Failed to init GoogleGenAI:', err);
  }
}

async function callGeminiWithTimeout(prompt: string, timeoutMs = 3500): Promise<string | null> {
  if (!genAI) return null;
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Gemini API call timed out')), timeoutMs)
    );
    const callPromise = genAI.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });
    const result: any = await Promise.race([callPromise, timeoutPromise]);
    return result?.text || null;
  } catch (err) {
    console.warn('Gemini API skipped or timed out, using fallback:', (err as Error).message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// 1. AI Saathi API Routes (Gemini 3.8 Flash + Fast Municipal Fallback)
// ---------------------------------------------------------------------------

// Smart Complaint Categorization & Duplicate Detection
app.post('/api/ai/categorize', async (req: Request, res: Response) => {
  try {
    const { title, description, area, existingComplaints } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description required' });
    }

    const textToAnalyze = `${title || ''} ${description || ''}`.toLowerCase();

    // Check Gemini first with timeout
    const geminiPrompt = `Analyze this civic issue report:
Title: "${title || ''}"
Description: "${description || ''}"
Area: "${area || ''}"

Return a JSON object with:
- "suggestedCategory": One of ["potholes", "garbage", "drainage", "water_leakage", "streetlight", "public_facility", "other"]
- "categoryName": Human readable title
- "department": Responsible department (e.g. Public Works, Solid Waste Management, Sanitation, Water Supply, Lighting)
- "urgency": "low" | "medium" | "high" | "critical"
- "urgencyReason": 1 short sentence explanation
- "civicTips": 2 short safety tips array
- "isDuplicateCandidate": boolean
- "duplicateReason": short note

Respond ONLY with valid JSON.`;

    const rawText = await callGeminiWithTimeout(geminiPrompt, 3500);
    if (rawText) {
      try {
        const cleaned = rawText.replace(/```json|```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return res.json(parsed);
      } catch {
        // Fall through to heuristic
      }
    }

    // Heuristic Fallback
    let category = 'other';
    let categoryName = 'General Civic Issue';
    let department = 'Municipal Citizen Care';
    let urgency = 'medium';

    if (textToAnalyze.includes('pothole') || textToAnalyze.includes('road') || textToAnalyze.includes('asphalt') || textToAnalyze.includes('sinkhole') || textToAnalyze.includes('crater')) {
      category = 'potholes';
      categoryName = 'Potholes & Road Damage';
      department = 'Public Works Department';
      urgency = textToAnalyze.includes('deep') || textToAnalyze.includes('accident') || textToAnalyze.includes('skid') ? 'high' : 'medium';
    } else if (textToAnalyze.includes('garbage') || textToAnalyze.includes('trash') || textToAnalyze.includes('waste') || textToAnalyze.includes('dump') || textToAnalyze.includes('bin')) {
      category = 'garbage';
      categoryName = 'Garbage & Waste Accumulation';
      department = 'Solid Waste Management';
      urgency = 'medium';
    } else if (textToAnalyze.includes('drain') || textToAnalyze.includes('sewage') || textToAnalyze.includes('manhole') || textToAnalyze.includes('gutter') || textToAnalyze.includes('clog')) {
      category = 'drainage';
      categoryName = 'Drainage & Sewage Overflow';
      department = 'Sanitation & Drainage Board';
      urgency = textToAnalyze.includes('overflow') || textToAnalyze.includes('flood') ? 'high' : 'medium';
    } else if (textToAnalyze.includes('water') || textToAnalyze.includes('leak') || textToAnalyze.includes('pipe') || textToAnalyze.includes('tap') || textToAnalyze.includes('gush')) {
      category = 'water_leakage';
      categoryName = 'Drinking Water Pipe Leakage';
      department = 'Water Supply & Sewerage Board';
      urgency = 'high';
    } else if (textToAnalyze.includes('light') || textToAnalyze.includes('lamp') || textToAnalyze.includes('dark') || textToAnalyze.includes('pole') || textToAnalyze.includes('fused')) {
      category = 'streetlight';
      categoryName = 'Broken Streetlight & Dark Spots';
      department = 'Electrical & Public Lighting Dept';
      urgency = textToAnalyze.includes('school') || textToAnalyze.includes('women') ? 'high' : 'medium';
    } else if (textToAnalyze.includes('bench') || textToAnalyze.includes('park') || textToAnalyze.includes('toilet') || textToAnalyze.includes('garden')) {
      category = 'public_facility';
      categoryName = 'Public Facility & Park Damage';
      department = 'Horticulture & Parks Dept';
      urgency = 'low';
    }

    // Check duplicate candidates against existing
    let isDuplicateCandidate = false;
    let duplicateReason = '';
    if (existingComplaints && Array.isArray(existingComplaints)) {
      for (const comp of existingComplaints) {
        if (comp.category === categoryName && comp.area === area) {
          isDuplicateCandidate = true;
          duplicateReason = `Potential duplicate candidate found in same ward: ${comp.ref || ''} "${comp.title || ''}"`;
          break;
        }
      }
    }

    return res.json({
      suggestedCategory: category,
      categoryName,
      department,
      urgency,
      urgencyReason: `Classified as ${categoryName} under ${department} (Target SLA: 2-4 business days).`,
      civicTips: [
        'Ensure the photo clearly captures nearby landmarks or street signs for field crews.',
        'If this issue presents an active hazard to pedestrians or traffic, notify community volunteers.',
      ],
      isDuplicateCandidate,
      duplicateReason,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/categorize:', error);
    return res.json({
      suggestedCategory: 'other',
      categoryName: 'General Civic Issue',
      department: 'Municipal Citizen Care',
      urgency: 'medium',
      urgencyReason: 'Standard civic evaluation.',
      civicTips: ['Ensure accurate location coordinates.'],
      isDuplicateCandidate: false,
    });
  }
});

// AI Saathi Community Chatbot
app.post('/api/ai/assistant', async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const systemInstruction = `You are AI Saathi, the official helpful AI community assistant for CivicSaathi.
CivicSaathi is a multipurpose community platform with 7 modules:
1. Civic Issue Reporting: Roads, garbage, drains, streetlights, water leakage.
2. Community Help Network: Non-emergency assistance (elderly care, groceries, tech help).
3. Give, Donate & Reuse: Rehoming books, clothes, furniture, appliances.
4. Local Services Directory: Verified primary clinics, blood banks, municipal offices.
5. Student & Opportunity Hub: Scholarships, civic internships, free vocational courses.
6. Community Events: Cleanliness drives, blood camps, plantation.
7. Admin & Moderation: Transparent tracking, SLA audit logs.

CRITICAL BOUNDARIES:
- CivicSaathi is NOT an emergency response provider. For life-threatening emergencies, medical distress, fires, or crime, immediately urge users to call official emergency numbers (112 / 911 / 102).
- Never claim a physical issue has been fixed without municipal confirmation.
- Be polite, constructive, clear, and concise.`;

    const rawText = await callGeminiWithTimeout(`${systemInstruction}\n\nUser Question: ${message}`, 3500);
    if (rawText) {
      return res.json({ reply: rawText });
    }

    // Heuristic response
    const lower = message.toLowerCase();
    let reply = "Hello! I am AI Saathi. You can use CivicSaathi to report civic issues like potholes or broken streetlights, request or offer community help, donate reusable items, and find verified local services and student opportunities.";

    if (lower.includes('emergency') || lower.includes('fire') || lower.includes('heart') || lower.includes('crime') || lower.includes('police')) {
      reply = "CRITICAL NOTICE: CivicSaathi is a non-emergency community platform. If you are experiencing a life-threatening emergency, crime, fire, or severe medical crisis, please call 112 (National Emergency Helpline), 101 (Fire), or 102/108 (Ambulance) immediately.";
    } else if (lower.includes('drain') || lower.includes('sewage') || lower.includes('overflow')) {
      reply = "To report a blocked storm drain or sewage overflow:\n1. Head to the 'Civic Issues' tab.\n2. Click '+ Report an Issue' and select 'Drainage & Sewage Overflow'.\n3. Mark the exact pin location on OpenStreetMap and attach a photo.\nThe Sanitation & Drainage Board SLA is 3 business days, and you can track real-time contractor dispatches in your report's timeline.";
    } else if (lower.includes('pothole') || lower.includes('road')) {
      reply = "To report potholes or road damage, open 'Civic Issues' and click '+ Report an Issue'. The Public Works Department (PWD) has a 4-day SLA. You will receive an immediate reference number (e.g. CS-2026-XXXX) with transparent audit tracking.";
    } else if (lower.includes('light') || lower.includes('dark') || lower.includes('lamp')) {
      reply = "For broken streetlights or dark hazardous stretches, submit a report under the 'Broken Streetlight & Dark Spots' category. The Electrical & Lighting Department SLA is 3 days. Mention landmark pole numbers if visible!";
    } else if (lower.includes('donate') || lower.includes('book') || lower.includes('cloth') || lower.includes('furniture')) {
      reply = "You can list reusable books, clothes, furniture, or assistive gear in the 'Give & Reuse' section. Community members can request items, and you can arrange a safe public handover at your local Community Center safe spot.";
    } else if (lower.includes('volunteer') || lower.includes('help') || lower.includes('elderly') || lower.includes('medicine')) {
      reply = "Check the 'Community Help' tab to browse open requests from neighbors needing errands, elderly check-ins, or student tutoring. Switch your persona to 'Volunteer' via the top-right menu to offer help directly!";
    } else if (lower.includes('scholarship') || lower.includes('intern') || lower.includes('job') || lower.includes('course')) {
      reply = "Explore the 'Student & Opportunity Hub' tab to find verified government scholarships, civic youth fellowships, and free NSDC solar/EV technical training with direct official application links.";
    }

    return res.json({ reply });
  } catch (error: any) {
    console.error('Error in /api/ai/assistant:', error);
    return res.json({
      reply: "Namaste! I am AI Saathi. You can use CivicSaathi to report civic issues, find local health clinics and blood banks in the Directory, or request community assistance.",
    });
  }
});

// ---------------------------------------------------------------------------
// 2. Python / Django Code Inspection & Download Endpoints
// ---------------------------------------------------------------------------
app.get('/api/django/code', (req: Request, res: Response) => {
  try {
    const basePath = path.join(__dirname, 'backend_django');
    const files = [
      { name: 'schema.sql', path: 'schema.sql', language: 'sql', description: 'Production MySQL Relational Database DDL' },
      { name: 'models.py', path: 'core/models.py', language: 'python', description: 'Django ORM Models (User, Complaint, HelpRequest, Donation, etc.)' },
      { name: 'views.py', path: 'core/views.py', language: 'python', description: 'Django REST Framework API Views & Workflows' },
      { name: 'serializers.py', path: 'core/serializers.py', language: 'python', description: 'DRF Serializers for Data Validation' },
      { name: 'settings.py', path: 'civicsaathi/settings.py', language: 'python', description: 'Django Settings configured for MySQL Database' },
      { name: 'urls.py', path: 'core/urls.py', language: 'python', description: 'API Route Router' },
      { name: 'README.md', path: 'README.md', language: 'markdown', description: 'Setup & Deployment Guide for Python & MySQL' },
    ];

    const result = files.map(f => {
      const fullPath = path.join(basePath, f.path);
      const content = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, 'utf-8') : '# File not found';
      return {
        ...f,
        content,
      };
    });

    res.json({ files: result });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to read Django files' });
  }
});

// ---------------------------------------------------------------------------
// 3. PowerPoint Presentation Download Endpoint
// ---------------------------------------------------------------------------
app.get('/api/download-pptx', (_req: Request, res: Response) => {
  const pptxPath = path.join(__dirname, 'CivicSaathi_Presentation.pptx');
  if (fs.existsSync(pptxPath)) {
    res.setHeader('Content-Disposition', 'attachment; filename="CivicSaathi_Presentation.pptx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    return res.sendFile(pptxPath);
  } else {
    return res.status(404).json({ error: 'Presentation file not found. Please run generation script.' });
  }
});

// ---------------------------------------------------------------------------
// 3. Vite Middleware integration
// ---------------------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CivicSaathi server is active at http://0.0.0.0:${PORT}`);
  });
}

startServer();
