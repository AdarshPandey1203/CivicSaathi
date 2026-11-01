import pptxgen from 'pptxgenjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function generateSimplePresentation() {
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_16x9';
  pres.title = 'CivicSaathi - Simple & Realistic Project Presentation';
  pres.author = 'CivicSaathi Project';
  pres.subject = 'Community Grievance & Assistance Redressal Platform';

  // Palette
  const C_NAVY = '0F172A';
  const C_SLATE = '1E293B';
  const C_LIGHT_BG = 'F8FAFC';
  const C_WHITE = 'FFFFFF';
  const C_EMERALD = '059669';
  const C_EMERALD_LIGHT = 'D1FAE5';
  const C_BLUE = '2563EB';
  const C_TEXT_DARK = '0F172A';
  const C_TEXT_MUTED = '64748B';
  const C_BORDER = 'E2E8F0';

  // Header helper
  const addHeader = (slide: any, title: string, category: string) => {
    slide.background = { color: C_LIGHT_BG };

    slide.addShape(pres.ShapeType.rect, {
      x: 0,
      y: 0,
      w: '100%',
      h: 0.1,
      fill: { color: C_EMERALD },
    });

    slide.addText(category.toUpperCase(), {
      x: 0.8,
      y: 0.4,
      w: 8,
      h: 0.3,
      fontSize: 11,
      fontFace: 'Arial',
      color: C_EMERALD,
      bold: true,
    });

    slide.addText(title, {
      x: 0.8,
      y: 0.75,
      w: 11.5,
      h: 0.6,
      fontSize: 22,
      fontFace: 'Arial',
      color: C_TEXT_DARK,
      bold: true,
    });

    slide.addShape(pres.ShapeType.line, {
      x: 0.8,
      y: 1.4,
      w: 11.7,
      h: 0,
      line: { color: C_BORDER, width: 1 },
    });

    slide.addText('CivicSaathi  •  Simple, Realistic & Practical Civic Platform', {
      x: 0.8,
      y: 7.1,
      w: 8,
      h: 0.3,
      fontSize: 9,
      fontFace: 'Arial',
      color: C_TEXT_MUTED,
    });
  };

  // ---------------------------------------------------------
  // SLIDE 1: TITLE SLIDE
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    slide.background = { color: C_NAVY };

    slide.addShape(pres.ShapeType.rect, {
      x: 1.0,
      y: 1.8,
      w: 0.2,
      h: 3.2,
      fill: { color: C_EMERALD },
    });

    slide.addText('CivicSaathi', {
      x: 1.4,
      y: 1.6,
      w: 10,
      h: 1.1,
      fontSize: 48,
      fontFace: 'Arial',
      bold: true,
      color: C_WHITE,
    });

    slide.addText('Community Assistance & Civic Grievance Redressal Platform', {
      x: 1.4,
      y: 2.8,
      w: 10,
      h: 0.5,
      fontSize: 18,
      fontFace: 'Arial',
      color: '38BDF8',
      bold: true,
    });

    slide.addText('A simple, practical web application connecting citizens directly with municipal departments.\nNo complicated promises — just a real, working solution for everyday neighborhood issues.', {
      x: 1.4,
      y: 3.5,
      w: 10,
      h: 0.8,
      fontSize: 13,
      fontFace: 'Arial',
      color: '94A3B8',
    });

    slide.addShape(pres.ShapeType.roundRect, {
      x: 1.4,
      y: 5.2,
      w: 10.5,
      h: 1.3,
      fill: { color: C_SLATE },
      rectRadius: 0.08,
      line: { color: '334155', width: 1 },
    });

    slide.addText([
      { text: 'Project Focus: ', options: { bold: true, color: C_WHITE } },
      { text: 'Simple & Realistic Full-Stack Web Application\n', options: { color: 'CBD5E1' } },
      { text: 'Core Architecture: ', options: { bold: true, color: C_WHITE } },
      { text: 'React Frontend + Express Backend + Relational Database Design\n', options: { color: 'CBD5E1' } },
      { text: 'Key Deliverable: ', options: { bold: true, color: C_WHITE } },
      { text: '5 Core Practical Modules (Easy to explain and defend in viva)', options: { color: 'CBD5E1' } },
    ], {
      x: 1.7,
      y: 5.35,
      w: 10,
      h: 1.0,
      fontSize: 11,
      fontFace: 'Arial',
    });

    slide.addNotes('Good morning respected teachers. Today I am presenting my project CivicSaathi. It is a simple, realistic web platform that helps citizens report neighborhood problems like road potholes or broken streetlights, and helps government officers track and fix them easily.');
  }

  // ---------------------------------------------------------
  // SLIDE 2: THE PROBLEM (WHY THIS IS NEEDED)
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    addHeader(slide, 'The Real-World Problem: Why We Need This', 'Project Background');

    const problems = [
      {
        title: '1. Paper Complaints Get Lost',
        desc: 'Traditionally, citizens must write complaints on paper or visit the municipal office in person. Many complaints are misplaced, forgotten, or never assigned.',
      },
      {
        title: '2. Missing Photo & Location Proof',
        desc: 'When people complain on the phone, they cannot show the exact photo or location. Repair crews struggle to find the exact pothole or broken water pipe.',
      },
      {
        title: '3. Zero Status Transparency',
        desc: 'Citizens have no idea what happened to their complaint. Did someone inspect it? Is someone working on it? Is it fixed? There is no reference number.',
      },
      {
        title: '4. Disorganized Municipal Work',
        desc: 'Municipal staff do not have a single simple screen to see which issues belong to Roads, Water, Sanitation, or Electricity.',
      },
    ];

    problems.forEach((p, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 0.8 + (col * 5.95);
      const y = 1.8 + (row * 2.45);

      slide.addShape(pres.ShapeType.roundRect, {
        x,
        y,
        w: 5.75,
        h: 2.25,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.08,
      });

      slide.addText(p.title, {
        x: x + 0.3,
        y: y + 0.3,
        w: 5.1,
        h: 0.4,
        fontSize: 14,
        bold: true,
        color: 'DC2626',
      });

      slide.addText(p.desc, {
        x: x + 0.3,
        y: y + 0.8,
        w: 5.1,
        h: 1.2,
        fontSize: 11,
        color: C_TEXT_MUTED,
        lineSpacing: 16,
      });
    });

    slide.addNotes('In our daily lives, whenever there is a dirty garbage dump or a broken streetlight, we do not know where to complain. If we call, nobody follows up. Our project solves this real practical problem.');
  }

  // ---------------------------------------------------------
  // SLIDE 3: WHAT IS CIVICSAATHI & ITS BENEFITS
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    addHeader(slide, 'What is CivicSaathi and What are the Benefits?', 'Solution & Value');

    // Benefit Cards
    const benefits = [
      {
        title: 'For the Citizens',
        color: C_BLUE,
        points: [
          '• File a complaint in under 1 minute from home.',
          '• Attach photos from phone camera or gallery.',
          '• Get a unique Reference ID (e.g. CS-2026-1042).',
          '• Live status tracking (Submitted ➔ In Progress ➔ Resolved).',
          '• Download or print an official confirmation receipt.',
        ],
      },
      {
        title: 'For Municipal Department Staff',
        color: C_EMERALD,
        points: [
          '• Clean dashboard with issues filtered by department.',
          '• See exact location and photo before sending a repair truck.',
          '• One-click status updates with officer remarks.',
          '• Automated alert triggers sent to the citizen.',
          '• Clear accountability of who resolved the issue.',
        ],
      },
    ];

    benefits.forEach((b, idx) => {
      const x = 0.8 + (idx * 5.95);
      slide.addShape(pres.ShapeType.roundRect, {
        x,
        y: 1.8,
        w: 5.75,
        h: 4.8,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.1,
      });

      slide.addShape(pres.ShapeType.rect, {
        x,
        y: 1.8,
        w: 5.75,
        h: 0.1,
        fill: { color: b.color },
      });

      slide.addText(b.title, {
        x: x + 0.4,
        y: 2.2,
        w: 5.0,
        h: 0.4,
        fontSize: 16,
        bold: true,
        color: C_TEXT_DARK,
      });

      slide.addText(b.points.join('\n\n'), {
        x: x + 0.4,
        y: 2.8,
        w: 5.0,
        h: 3.5,
        fontSize: 11,
        color: C_TEXT_MUTED,
        lineSpacing: 16,
      });
    });

    slide.addNotes('CivicSaathi provides clear benefits to both sides: citizens save time and get proof, while government workers get organized and know exactly where to send their repair team.');
  }

  // ---------------------------------------------------------
  // SLIDE 4: THE 5 CORE MODULES (OVERVIEW)
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Project Scope: Exactly 5 Core Modules', 'System Modules');

    const modules = [
      { num: 'M1', title: 'User & Role Authentication', desc: 'Separate login for Citizens and Government Officers with role-based security.' },
      { num: 'M2', title: 'Grievance & Assistance Filing', desc: 'Category selection, live camera/gallery photo upload, address and GPS coordinates.' },
      { num: 'M3', title: 'Citizen Tracking Dashboard', desc: 'Personal complaint history, visual status badges, and safe report cancellation.' },
      { num: 'M4', title: 'Government Department Console', desc: 'Departmental triage, status transition engine, and mandatory officer remarks.' },
      { num: 'M5', title: 'Digital Receipt & QR Verification', desc: 'Printable official municipal certificate with reference number and verification QR.' },
    ];

    modules.forEach((m, idx) => {
      const y = 1.8 + (idx * 0.98);
      slide.addShape(pres.ShapeType.roundRect, {
        x: 0.8,
        y,
        w: 11.7,
        h: 0.85,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.08,
      });

      slide.addShape(pres.ShapeType.roundRect, {
        x: 1.0,
        y: y + 0.15,
        w: 0.7,
        h: 0.55,
        fill: { color: C_EMERALD_LIGHT },
        rectRadius: 0.05,
      });

      slide.addText(m.num, {
        x: 1.0,
        y: y + 0.22,
        w: 0.7,
        h: 0.4,
        fontSize: 12,
        bold: true,
        color: C_EMERALD,
        align: 'center',
      });

      slide.addText(m.title, {
        x: 1.9,
        y: y + 0.15,
        w: 3.5,
        h: 0.3,
        fontSize: 13,
        bold: true,
        color: C_TEXT_DARK,
      });

      slide.addText(m.desc, {
        x: 1.9,
        y: y + 0.45,
        w: 10.3,
        h: 0.35,
        fontSize: 10,
        color: C_TEXT_MUTED,
      });
    });

    slide.addNotes('To keep the system robust, realistic, and completely functional, we organized the entire platform into exactly 5 core modules. Each module has a specific, clear purpose.');
  }

  // ---------------------------------------------------------
  // SLIDE 5: MODULE 1 & MODULE 2 DETAILS
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Modules 1 & 2: User Access & Issue Registration', 'Module Details');

    // Module 1 Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.75,
      h: 4.8,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Module 1: User & Role Authentication', {
      x: 1.1,
      y: 2.1,
      w: 5.1,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: C_TEXT_DARK,
    });

    slide.addText([
      { text: 'Purpose: ', options: { bold: true, color: C_BLUE } },
      { text: 'Ensures only authorized citizens report and only official staff update tickets.\n\n' },
      { text: '• Citizen Sign-In: ', options: { bold: true } },
      { text: 'Email, name, phone number, and residential ward.\n\n' },
      { text: '• Department Officer Sign-In: ', options: { bold: true } },
      { text: 'Official municipal ID and department assignment (Roads, Water, Sanitation, Power).\n\n' },
      { text: '• Security Boundary: ', options: { bold: true } },
      { text: 'Citizens cannot alter official statuses, ensuring total administrative integrity.\n' },
    ], {
      x: 1.1,
      y: 2.6,
      w: 5.1,
      h: 3.8,
      fontSize: 11,
      color: C_TEXT_MUTED,
      lineSpacing: 15,
    });

    // Module 2 Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y: 1.8,
      w: 5.75,
      h: 4.8,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Module 2: Grievance & Assistance Filing', {
      x: 7.1,
      y: 2.1,
      w: 5.1,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: C_TEXT_DARK,
    });

    slide.addText([
      { text: 'Purpose: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Allows anyone to file a civic complaint in under 60 seconds.\n\n' },
      { text: '• Clear Categorization: ', options: { bold: true } },
      { text: 'Road Potholes, Water Leaks, Garbage Dumps, Dark Streetlights, Drainage.\n\n' },
      { text: '• Real Photo Evidence: ', options: { bold: true } },
      { text: 'Live camera snapshot via browser or photo upload from device gallery.\n\n' },
      { text: '• Location Accuracy: ', options: { bold: true } },
      { text: 'One-click GPS coordinate capture + street landmark input.\n' },
    ], {
      x: 7.1,
      y: 2.6,
      w: 5.1,
      h: 3.8,
      fontSize: 11,
      color: C_TEXT_MUTED,
      lineSpacing: 15,
    });

    slide.addNotes('In Module 1, we separate the citizen from the municipal officer. In Module 2, the citizen can snap a live photo of a pothole, enter their street, and submit.');
  }

  // ---------------------------------------------------------
  // SLIDE 6: MODULE 3 & MODULE 4 DETAILS
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Modules 3 & 4: Citizen Tracking & Government Redressal', 'Module Details');

    // Module 3 Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 5.75,
      h: 4.8,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Module 3: Citizen Tracking Dashboard', {
      x: 1.1,
      y: 2.1,
      w: 5.1,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: C_TEXT_DARK,
    });

    slide.addText([
      { text: 'Purpose: ', options: { bold: true, color: C_BLUE } },
      { text: 'Gives the resident complete transparency and tracking.\n\n' },
      { text: '• Status Progression Badges: ', options: { bold: true } },
      { text: 'Submitted (Blue) ➔ In Progress (Amber) ➔ Resolved (Green).\n\n' },
      { text: '• Actionable Timeline: ', options: { bold: true } },
      { text: 'See when an officer inspected the report and read their official notes.\n\n' },
      { text: '• Safe Deletion: ', options: { bold: true } },
      { text: 'Allows citizens to delete a report if filed mistakenly before inspection starts.\n' },
    ], {
      x: 1.1,
      y: 2.6,
      w: 5.1,
      h: 3.8,
      fontSize: 11,
      color: C_TEXT_MUTED,
      lineSpacing: 15,
    });

    // Module 4 Card
    slide.addShape(pres.ShapeType.roundRect, {
      x: 6.8,
      y: 1.8,
      w: 5.75,
      h: 4.8,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Module 4: Government Department Console', {
      x: 7.1,
      y: 2.1,
      w: 5.1,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: C_TEXT_DARK,
    });

    slide.addText([
      { text: 'Purpose: ', options: { bold: true, color: C_EMERALD } },
      { text: 'Equips officers with an organized operational workspace.\n\n' },
      { text: '• Department Filtering: ', options: { bold: true } },
      { text: 'Roads, Water, Sanitation, and Electricity teams view only their issues.\n\n' },
      { text: '• Resolution Engine: ', options: { bold: true } },
      { text: 'Update status with mandatory work remarks (e.g. "Patching crew dispatched").\n\n' },
      { text: '• Alert Trigger: ', options: { bold: true } },
      { text: 'Status change events automatically trigger simulated notification alerts.\n' },
    ], {
      x: 7.1,
      y: 2.6,
      w: 5.1,
      h: 3.8,
      fontSize: 11,
      color: C_TEXT_MUTED,
      lineSpacing: 15,
    });

    slide.addNotes('Module 3 lets the citizen see progress in real time. Module 4 gives the municipal engineer a simple screen to review the photo and update the status with repair remarks.');
  }

  // ---------------------------------------------------------
  // SLIDE 7: MODULE 5 & VERIFICATION (PRINTABLE SLIP)
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Module 5: Digital Receipt & QR Verification', 'Proof & Audit');

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 11.7,
      h: 4.8,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Official Proof of Redressal for Citizens', {
      x: 1.2,
      y: 2.1,
      w: 10,
      h: 0.4,
      fontSize: 16,
      bold: true,
      color: C_TEXT_DARK,
    });

    const receiptFeatures = [
      {
        title: 'Unique Reference ID',
        desc: 'Every complaint generates an instant reference code like CS-2026-8412 for direct tracking and inquiries.',
      },
      {
        title: 'Print / PDF Optimized',
        desc: 'Formatted with professional municipal styling and print-friendly layout for physical filing or records.',
      },
      {
        title: 'Scannable QR Code',
        desc: 'Inline SVG QR code that encodes the reference ID and verification link for quick field scanning.',
      },
      {
        title: 'Tamper-Evident History',
        desc: 'Lists the reporting timestamp, department name, and officer remarks for complete legal accountability.',
      },
    ];

    receiptFeatures.forEach((rf, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 1.2 + (col * 5.6);
      const y = 2.8 + (row * 1.7);

      slide.addShape(pres.ShapeType.roundRect, {
        x,
        y,
        w: 5.3,
        h: 1.4,
        fill: { color: C_LIGHT_BG },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.08,
      });

      slide.addText(rf.title, {
        x: x + 0.3,
        y: y + 0.2,
        w: 4.7,
        h: 0.35,
        fontSize: 13,
        bold: true,
        color: C_EMERALD,
      });

      slide.addText(rf.desc, {
        x: x + 0.3,
        y: y + 0.55,
        w: 4.7,
        h: 0.75,
        fontSize: 10.5,
        color: C_TEXT_MUTED,
        lineSpacing: 14,
      });
    });

    slide.addNotes('Module 5 is very important: citizens can click "Print Receipt" to get a formal municipal complaint slip with a QR code. This gives them official proof that their complaint was registered.');
  }

  // ---------------------------------------------------------
  // SLIDE 8: SIMPLE TECHNOLOGY STACK & DATABASE
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Simple & Realistic Technology Stack', 'Technology');

    const techColumns = [
      {
        title: 'Frontend (Client)',
        color: C_BLUE,
        items: [
          '• React 19 SPA (Component-based)',
          '• TypeScript (Type safety)',
          '• Tailwind CSS v4 (Clean styling)',
          '• Native WebRTC Camera API',
          '• OpenStreetMap Geolocation',
        ],
      },
      {
        title: 'Backend (Server)',
        color: C_EMERALD,
        items: [
          '• Node.js & Express.js',
          '• REST API Endpoints',
          '• Vite Dev Middleware',
          '• Role-Based Route Protection',
          '• Notification Dispatcher',
        ],
      },
      {
        title: 'Database (Relational)',
        color: 'D97706',
        items: [
          '• MySQL 8.0 / Django ORM',
          '• Users Table (Citizens/Officers)',
          '• Complaints Table (Issues/Photos)',
          '• Status History Table (Audit)',
          '• Standard 3NF Normalization',
        ],
      },
    ];

    techColumns.forEach((col, idx) => {
      const x = 0.8 + (idx * 3.95);
      slide.addShape(pres.ShapeType.roundRect, {
        x,
        y: 1.8,
        w: 3.8,
        h: 4.8,
        fill: { color: C_WHITE },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.1,
      });

      slide.addShape(pres.ShapeType.rect, {
        x,
        y: 1.8,
        w: 3.8,
        h: 0.1,
        fill: { color: col.color },
      });

      slide.addText(col.title, {
        x: x + 0.3,
        y: 2.1,
        w: 3.2,
        h: 0.4,
        fontSize: 15,
        bold: true,
        color: C_TEXT_DARK,
      });

      slide.addText(col.items.join('\n\n'), {
        x: x + 0.3,
        y: 2.7,
        w: 3.2,
        h: 3.6,
        fontSize: 11,
        color: C_TEXT_MUTED,
        lineSpacing: 16,
      });
    });

    slide.addNotes('We chose standard, industry-proven technologies that are easy to understand and maintain: React for the frontend, Node and Express for the server, and a simple normalized relational database.');
  }

  // ---------------------------------------------------------
  // SLIDE 9: VIVA DEFENSE GUIDE (WHAT WE DID & WHY)
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    addHeader(slide, 'Project Defense: Practical & Realistic Decisions', 'Viva Defense');

    slide.addShape(pres.ShapeType.roundRect, {
      x: 0.8,
      y: 1.8,
      w: 11.7,
      h: 4.8,
      fill: { color: C_WHITE },
      line: { color: C_BORDER, width: 1 },
      rectRadius: 0.1,
    });

    slide.addText('Why this approach works and is easy to explain:', {
      x: 1.2,
      y: 2.1,
      w: 10,
      h: 0.4,
      fontSize: 15,
      bold: true,
      color: C_TEXT_DARK,
    });

    const defensePoints = [
      {
        q: 'Why Web-Based instead of Native App?',
        a: 'Citizens should not have to download a heavy 80MB app just to report one pothole. A web application opens instantly on any phone browser.',
      },
      {
        q: 'Why 5 Focused Modules?',
        a: 'Instead of building 20 half-baked features, we focused on the 5 essential steps that actually make a civic complaint system work from start to finish.',
      },
      {
        q: 'How is data kept secure?',
        a: 'Citizens cannot change complaint statuses or see other citizens’ private contact details. Only authenticated municipal officers can transition tickets.',
      },
      {
        q: 'Is it ready for real deployment?',
        a: 'Yes. The frontend runs in any modern browser, the API handles requests smoothly, and the relational database schemas are completely defined.',
      },
    ];

    defensePoints.forEach((dp, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const x = 1.2 + (col * 5.6);
      const y = 2.7 + (row * 1.8);

      slide.addShape(pres.ShapeType.roundRect, {
        x,
        y,
        w: 5.3,
        h: 1.55,
        fill: { color: C_LIGHT_BG },
        line: { color: C_BORDER, width: 1 },
        rectRadius: 0.08,
      });

      slide.addText(`Q: ${dp.q}`, {
        x: x + 0.25,
        y: y + 0.15,
        w: 4.8,
        h: 0.35,
        fontSize: 11.5,
        bold: true,
        color: C_BLUE,
      });

      slide.addText(`A: ${dp.a}`, {
        x: x + 0.25,
        y: y + 0.55,
        w: 4.8,
        h: 0.85,
        fontSize: 10,
        color: C_TEXT_MUTED,
        lineSpacing: 14,
      });
    });

    slide.addNotes('If examiners ask why we did not build a heavy mobile app or complex artificial intelligence, we clearly explain: our goal was accessibility and simplicity so anyone can report issues without downloading apps.');
  }

  // ---------------------------------------------------------
  // SLIDE 10: CONCLUSION & DEMO
  // ---------------------------------------------------------
  {
    const slide = pres.addSlide();
    slide.background = { color: C_NAVY };

    slide.addText('Conclusion & Live Demonstration', {
      x: 1.5,
      y: 1.8,
      w: 10.3,
      h: 0.5,
      fontSize: 18,
      bold: true,
      color: '38BDF8',
      align: 'center',
    });

    slide.addText('CivicSaathi is 100% Functional & Ready', {
      x: 1.5,
      y: 2.4,
      w: 10.3,
      h: 1.0,
      fontSize: 42,
      bold: true,
      color: C_WHITE,
      align: 'center',
    });

    slide.addText('• 5 Clean, Focused Modules\n• Real-Time Photo & GPS Evidence\n• Dual Portals for Citizens & Government\n• Official Printable Receipts with QR Code', {
      x: 3.5,
      y: 3.6,
      w: 6.5,
      h: 1.5,
      fontSize: 14,
      color: 'CBD5E1',
      lineSpacing: 18,
    });

    slide.addText('Thank you! I am now ready to demonstrate the live application.', {
      x: 1.5,
      y: 5.4,
      w: 10.3,
      h: 0.6,
      fontSize: 16,
      bold: true,
      color: C_EMERALD,
      align: 'center',
    });

    slide.addNotes('In conclusion, CivicSaathi is a working, reliable, and realistic solution to a problem we all face. Thank you for your time, and I am now ready to demonstrate the live application.');
  }

  const outputPath = path.join(__dirname, '..', 'CivicSaathi_Presentation.pptx');
  await pres.writeFile({ fileName: outputPath });
  console.log('Successfully generated clean 10-slide PowerPoint presentation at:', outputPath);
}

generateSimplePresentation().catch(err => {
  console.error('Error generating presentation:', err);
  process.exit(1);
});
