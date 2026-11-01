import React, { useState, useEffect } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Volume2,
  CheckCircle2,
  Shield,
  Layers,
  Smartphone,
  Building,
  Database,
  Camera,
  FileText,
  Clock,
  Printer,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface PresentationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PresentationModal: React.FC<PresentationModalProps> = ({ isOpen, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Strictly 10 clean, realistic slides aligned with the 5 core modules
  const totalSlides = 10;

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'Space') {
        setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentSlide((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        if (isFullscreen) {
          setIsFullscreen(false);
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isFullscreen, onClose, totalSlides]);

  if (!isOpen) return null;

  const handleDownloadPptx = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch('/api/download-pptx');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'CivicSaathi_Presentation.pptx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        window.open('/api/download-pptx', '_blank');
      }
    } catch {
      window.open('/api/download-pptx', '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  // Render individual slide content
  const renderSlideContent = () => {
    switch (currentSlide) {
      // ----------------------------------------------------
      // SLIDE 1: TITLE SLIDE
      // ----------------------------------------------------
      case 0:
        return (
          <div className="h-full bg-slate-900 text-white rounded-2xl p-8 md:p-14 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-6">
                <Sparkles className="w-3.5 h-3.5" /> Project Presentation & Viva Guide
              </div>

              <div className="flex items-start gap-4">
                <div className="w-2.5 h-20 bg-emerald-500 rounded-full mt-1 shrink-0" />
                <div>
                  <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-3">
                    CivicSaathi
                  </h1>
                  <p className="text-lg md:text-2xl font-medium text-sky-400 max-w-2xl leading-snug">
                    Community Assistance & Civic Grievance Redressal Portal
                  </p>
                </div>
              </div>

              <p className="text-slate-400 text-sm md:text-base mt-6 max-w-3xl leading-relaxed">
                A simple, reliable web platform bridging citizens and municipal departments to report, track, and resolve neighborhood problems with photo evidence and digital receipts.
              </p>
            </div>

            <div className="bg-slate-800/80 backdrop-blur-md rounded-xl p-5 border border-slate-700/60 mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Architecture</span>
                <span className="font-semibold text-slate-100">React + Node.js Express + MySQL</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Portals</span>
                <span className="font-semibold text-slate-100">Citizen Portal & Officer Console</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Scope</span>
                <span className="font-semibold text-emerald-400">Strictly 5 Practical Modules</span>
              </div>
              <div>
                <span className="text-slate-400 block mb-1">Goal</span>
                <span className="font-semibold text-sky-300">100% Defensible Viva Project</span>
              </div>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // SLIDE 2: THE PROBLEM STATEMENT
      // ----------------------------------------------------
      case 1:
        return (
          <div className="h-full bg-slate-50 rounded-2xl p-6 md:p-10 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="text-emerald-600 text-xs font-bold tracking-wider uppercase mb-1">Problem Statement</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
                Current Civic Grievance Difficulties
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  {
                    num: '01',
                    title: 'Physical Office Visits',
                    desc: 'Citizens must visit municipal offices in person or write paper complaints that frequently get misplaced or forgotten.',
                    color: 'border-t-rose-500 text-rose-600',
                  },
                  {
                    num: '02',
                    title: 'No Visual Evidence',
                    desc: 'Without photo proof or clear addresses, municipal staff cannot judge the severity of potholes, garbage piles, or leaks.',
                    color: 'border-t-amber-500 text-amber-600',
                  },
                  {
                    num: '03',
                    title: 'Zero Tracking or Updates',
                    desc: 'Citizens have no tracking number. They cannot tell if their complaint was assigned, inspected, or simply ignored.',
                    color: 'border-t-blue-500 text-blue-600',
                  },
                  {
                    num: '04',
                    title: 'No Officer Accountability',
                    desc: 'Departments lack an organized system to see incoming complaints by category, assign tasks, and record official remarks.',
                    color: 'border-t-emerald-500 text-emerald-600',
                  },
                ].map((item, idx) => (
                  <div key={idx} className={`bg-white rounded-xl p-5 shadow-sm border border-slate-200 border-t-4 ${item.color} flex flex-col justify-between`}>
                    <div>
                      <div className="text-2xl font-black mb-2 opacity-80">{item.num}</div>
                      <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
                      <p className="text-slate-600 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-800 flex items-center gap-3">
              <span className="font-bold text-rose-900 uppercase tracking-wide">Core Impact:</span>
              <span>Civic issues linger for weeks because there is no simple digital system connecting citizens to local municipal officers.</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // SLIDE 3: WHAT IS CIVICSAATHI & BENEFITS
      // ----------------------------------------------------
      case 2:
        return (
          <div className="h-full bg-slate-50 rounded-2xl p-6 md:p-10 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="text-emerald-600 text-xs font-bold tracking-wider uppercase mb-1">Product Overview</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
                What is CivicSaathi & Who Benefits?
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Benefits for Citizens */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-lg bg-blue-100 text-blue-700">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">For Everyday Citizens</h3>
                        <p className="text-xs text-slate-500">Fast, convenient, and verifiable</p>
                      </div>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Register in 60 Seconds:</strong> Lodge complaints anytime from mobile or PC without physical lines.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Camera & Gallery Upload:</strong> Attach live photo proof so authorities understand the exact issue.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Live Status Badges:</strong> See when the report moves from Pending → Under Review → Resolved.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Official Printable Slip:</strong> Download or print an official acknowledgement slip with QR code.</span>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Benefits for Municipal Authorities */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-700">
                        <Building className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">For Municipal Authorities</h3>
                        <p className="text-xs text-slate-500">Organized, transparent, and accountable</p>
                      </div>
                    </div>
                    <ul className="space-y-3 text-xs text-slate-700">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Clean Central Dashboard:</strong> View all civic reports categorized by sanitation, roads, water, or electricity.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Instant Status Updates:</strong> Change status with one click and provide mandatory officer remarks.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Department Filtering:</strong> Road engineers see road reports; sanitation officers see waste complaints.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span><strong>Public Trust & Auditability:</strong> Clear record of when issues were reported and how they were closed.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2">
              <span className="font-bold text-emerald-900 uppercase">Core Benefit:</span>
              <span>Replaces messy paper registries with a clear digital trail that both citizens and officers can trust.</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // SLIDE 4: THE 5 CORE MODULES OVERVIEW
      // ----------------------------------------------------
      case 3:
        return (
          <div className="h-full bg-slate-50 rounded-2xl p-6 md:p-10 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="text-emerald-600 text-xs font-bold tracking-wider uppercase mb-1">Architecture & Scope</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-2">
                System Scope: Exactly 5 Core Modules
              </h2>
              <p className="text-xs text-slate-600 mb-6">
                Designed to be practical, reliable, and completely defensible in project viva without unnecessary complexity.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  {
                    num: 'Module 1',
                    title: 'User & Role Authentication',
                    icon: <Shield className="w-5 h-5 text-indigo-600" />,
                    desc: 'Role-based login separating Citizens and Municipal Officers with protected access.',
                  },
                  {
                    num: 'Module 2',
                    title: 'Grievance Registration',
                    icon: <Camera className="w-5 h-5 text-emerald-600" />,
                    desc: 'Category picker, description, address, and live camera snapshot or photo upload.',
                  },
                  {
                    num: 'Module 3',
                    title: 'Citizen Tracking Dashboard',
                    icon: <Clock className="w-5 h-5 text-blue-600" />,
                    desc: 'Personal history view with status badges (Pending, In Progress, Resolved) and safe cancellation.',
                  },
                  {
                    num: 'Module 4',
                    title: 'Municipal Action Console',
                    icon: <Building className="w-5 h-5 text-purple-600" />,
                    desc: 'Administrative desk with department filters, status toggling, and mandatory officer notes.',
                  },
                  {
                    num: 'Module 5',
                    title: 'Digital Receipt & Verification',
                    icon: <Printer className="w-5 h-5 text-amber-600" />,
                    desc: 'Unique Reference ID generation, printable PDF receipt slip, and QR verification stamp.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-emerald-600 uppercase mb-1">{item.num}</div>
                      <div className="p-2 rounded-lg bg-slate-100 w-fit mb-3">{item.icon}</div>
                      <h3 className="font-bold text-slate-900 text-sm mb-2 leading-snug">{item.title}</h3>
                      <p className="text-slate-600 text-[11px] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 flex items-center justify-between">
              <span><strong>Design Principle:</strong> Every module is already implemented and functional in this application.</span>
              <span className="font-semibold text-sky-800">No unrealistic promises • No broken dependencies</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // SLIDE 5: MODULE 1 & MODULE 2 DETAILS
      // ----------------------------------------------------
      case 4:
        return (
          <div className="h-full bg-slate-50 rounded-2xl p-6 md:p-10 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="text-emerald-600 text-xs font-bold tracking-wider uppercase mb-1">Module Details</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
                Module 1 & 2: Authentication & Registration
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Module 1 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-700 text-xs font-bold">MODULE 1</span>
                    <h3 className="text-lg font-bold text-slate-900">User & Role Authentication</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    Ensures clean security and role segregation so citizens cannot alter government records and officers have proper authority.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Two Distinct Roles:</strong> Citizen Role vs. Municipal Officer Role.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Single Switcher Interface:</strong> Toggle between Citizen and Officer login tabs seamlessly.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Department Assignment:</strong> Officers authenticate under specific departments (Roads, Sanitation, Water, Electricity).</span>
                    </li>
                  </ul>
                </div>

                {/* Module 2 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-700 text-xs font-bold">MODULE 2</span>
                    <h3 className="text-lg font-bold text-slate-900">Grievance Registration with Photo</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    Provides an intuitive form where citizens can lodge complaints in under 60 seconds with photographic evidence.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Category Selection:</strong> Potholes, Garbage, Water Leakage, Streetlights, Drainage.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Camera Option:</strong> Open device camera directly to capture live photo proof of the problem.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Gallery Upload:</strong> Pick existing photos from gallery with automatic image preview.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Address & Ward Info:</strong> Clean address field ensures field crews know exactly where to go.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-center justify-between">
              <span><strong>Key Takeaway:</strong> Photo evidence prevents fake complaints and lets municipal engineers evaluate repair urgency immediately.</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // SLIDE 6: MODULE 3 & MODULE 4 DETAILS
      // ----------------------------------------------------
      case 5:
        return (
          <div className="h-full bg-slate-50 rounded-2xl p-6 md:p-10 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="text-emerald-600 text-xs font-bold tracking-wider uppercase mb-1">Module Details</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
                Module 3 & 4: Tracking & Municipal Console
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Module 3 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded bg-blue-100 text-blue-700 text-xs font-bold">MODULE 3</span>
                    <h3 className="text-lg font-bold text-slate-900">Citizen Tracking Dashboard</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    Gives the resident complete peace of mind with live milestone indicators and control over submitted reports.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Status Progression:</strong> Color-coded badges for Pending Review, In Progress, and Resolved.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Officer Remarks Display:</strong> Citizen reads the exact comments left by municipal officers.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Delete / Cancel Option:</strong> Citizens can safely delete duplicate or mistakenly filed complaints.</span>
                    </li>
                  </ul>
                </div>

                {/* Module 4 */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded bg-purple-100 text-purple-700 text-xs font-bold">MODULE 4</span>
                    <h3 className="text-lg font-bold text-slate-900">Municipal Action Console</h3>
                  </div>
                  <p className="text-xs text-slate-600 mb-4">
                    An efficient management interface for municipal staff to triage, prioritize, and update civic tickets.
                  </p>
                  <ul className="space-y-2.5 text-xs text-slate-700">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Department Filtering:</strong> Filter view by Roads, Sanitation, Water Works, or Electrical.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>One-Click Status Change:</strong> Update issue state with instant notification mock logging.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span><strong>Officer Remarks Enforced:</strong> Officers add notes explaining field action taken before resolving.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-center justify-between">
              <span><strong>Key Takeaway:</strong> Eliminates phone calls and office visits by maintaining a transparent status log online.</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // SLIDE 7: MODULE 5 DETAILS (RECEIPT & SLIP)
      // ----------------------------------------------------
      case 6:
        return (
          <div className="h-full bg-slate-50 rounded-2xl p-6 md:p-10 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="text-emerald-600 text-xs font-bold tracking-wider uppercase mb-1">Module Details</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
                Module 5: Digital Receipt & Verification Slip
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 bg-white rounded-xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="px-2.5 py-1 rounded bg-amber-100 text-amber-800 text-xs font-bold">MODULE 5</span>
                      <h3 className="text-lg font-bold text-slate-900">Official Physical & Digital Acknowledgment</h3>
                    </div>
                    <p className="text-xs text-slate-600 mb-4">
                      Every citizen complaint receives an official reference code and can be printed or saved as a verified PDF slip.
                    </p>

                    <div className="space-y-3 text-xs text-slate-700">
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Unique Tracking Reference:</strong> Formats like <code className="bg-slate-100 px-1 py-0.5 rounded text-emerald-700">REP-2026-X8K9</code> provide an unmistakable tracking ID.
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Print Slip Feature:</strong> One click opens a clean, printer-ready official municipal receipt formatted for standard A4 paper.
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Embedded QR Code:</strong> Contains the verification link so any field inspector can scan and check report authenticity.
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Citizen Proof of Submission:</strong> Protects citizens if an issue is ignored, giving them documentary proof for escalation.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-5 bg-slate-900 text-white rounded-xl p-6 flex flex-col justify-between shadow-md">
                  <div>
                    <div className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2">Slip Structure</div>
                    <h4 className="text-base font-bold text-white mb-3">What Appears on the Slip?</h4>
                    <div className="space-y-2 text-xs text-slate-300">
                      <div className="border-b border-slate-800 pb-1.5 flex justify-between">
                        <span>Header:</span>
                        <span className="text-slate-100 font-mono">CivicSaathi Municipal Redressal</span>
                      </div>
                      <div className="border-b border-slate-800 pb-1.5 flex justify-between">
                        <span>Reference ID:</span>
                        <span className="text-emerald-400 font-mono font-bold">REP-2026-0042</span>
                      </div>
                      <div className="border-b border-slate-800 pb-1.5 flex justify-between">
                        <span>Timestamp:</span>
                        <span className="text-slate-100">Exact date & time logged</span>
                      </div>
                      <div className="border-b border-slate-800 pb-1.5 flex justify-between">
                        <span>Category & Location:</span>
                        <span className="text-slate-100">Full address & landmark</span>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span>QR Verification:</span>
                        <span className="text-sky-300 font-semibold">Instant Authenticity Stamp</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 p-2.5 bg-slate-800/80 rounded-lg text-[11px] text-slate-400">
                    Works offline and online: printed paper can be submitted to ward councilors if needed.
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-center justify-between">
              <span><strong>Practical Value:</strong> Bridges the gap between digital systems and traditional paper-based municipal offices.</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // SLIDE 8: OPERATING ENVIRONMENT & DATABASE
      // ----------------------------------------------------
      case 7:
        return (
          <div className="h-full bg-slate-50 rounded-2xl p-6 md:p-10 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="text-emerald-600 text-xs font-bold tracking-wider uppercase mb-1">Technology & Database</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-6">
                Operating Environment & Database Architecture
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Hardware & Software */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-600" /> Operating Environment
                  </h3>
                  <div className="space-y-3 text-xs text-slate-700">
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <strong>Client (Citizen & Officer):</strong>
                      <p className="text-slate-600 mt-1">Any smartphone, tablet, or PC with modern web browser (Chrome, Safari, Edge, Firefox). Uses standard WebRTC camera APIs.</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <strong>Server & Runtime:</strong>
                      <p className="text-slate-600 mt-1">Node.js (v18+) with Express server, running light REST APIs for report submission, status updates, and PPT generation.</p>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                      <strong>Frontend Framework:</strong>
                      <p className="text-slate-600 mt-1">React 19 with TypeScript and Tailwind CSS for instant UI rendering and responsive design.</p>
                    </div>
                  </div>
                </div>

                {/* Database Schema */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                  <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Database className="w-5 h-5 text-emerald-600" /> Relational Database (MySQL)
                  </h3>
                  <div className="space-y-2 text-xs text-slate-700 font-mono">
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-indigo-600 font-bold font-sans">users table:</span>
                      <p className="text-slate-600 font-mono text-[11px] mt-0.5">id, full_name, email, role, department, created_at</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-emerald-600 font-bold font-sans">complaints table:</span>
                      <p className="text-slate-600 font-mono text-[11px] mt-0.5">id, ref_id, user_id, category, description, address, photo_url, status, officer_remarks, created_at</p>
                    </div>
                    <div className="p-2 bg-slate-50 rounded border border-slate-200">
                      <span className="text-blue-600 font-bold font-sans">complaint_history table:</span>
                      <p className="text-slate-600 font-mono text-[11px] mt-0.5">id, complaint_id, changed_by, old_status, new_status, remarks, timestamp</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-3">
                    Normalized 3NF relational design ensuring data integrity and fast queries without data redundancy.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 flex items-center justify-between">
              <span><strong>Defensible Architecture:</strong> Standard 3-tier web stack (Client → Server → Database) that any examiner recognizes and respects.</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // SLIDE 9: VIVA DEFENSE & EXAMINER Q&A
      // ----------------------------------------------------
      case 8:
        return (
          <div className="h-full bg-slate-50 rounded-2xl p-6 md:p-10 flex flex-col justify-between border border-slate-200">
            <div>
              <div className="text-emerald-600 text-xs font-bold tracking-wider uppercase mb-1">Viva & Evaluation Guide</div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">
                Smart Answers to Common Examiner Questions
              </h2>
              <p className="text-xs text-slate-600 mb-4">
                Confidence-building answers that stick to what is built without making difficult promises.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  {
                    q: 'Q1: Why did you not use complex AI or Computer Vision models?',
                    a: 'Answer: Our project focus is reliable civic infrastructure and immediate usability. Heavy AI models require expensive cloud GPUs and frequently hallucinate. A clean photo attached by a human citizen is 100% accurate, light on network bandwidth, and verifiable by municipal staff.',
                  },
                  {
                    q: 'Q2: How do you prevent fake or spam complaints?',
                    a: 'Answer: We require user authentication, capture direct live camera snapshots or gallery photos, log timestamps, and provide officers with full authority to mark complaints as Invalid with mandatory explanatory remarks.',
                  },
                  {
                    q: 'Q3: Why separate Citizen Portal and Municipal Portal?',
                    a: 'Answer: Role segregation ensures data security. Citizens can only view and manage their own submissions, while municipal officers can view complaints assigned to their department and update statuses.',
                  },
                  {
                    q: 'Q4: What happens if an area does not have high internet speed?',
                    a: 'Answer: Our web application is lightweight (<200KB bundle), compresses uploaded photos, and generates printable PDF slips that citizens can physically take to municipal ward offices if needed.',
                  },
                ].map((item, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1.5">
                        <HelpCircle className="w-4 h-4 shrink-0" />
                        <span>{item.q}</span>
                      </div>
                      <p className="text-slate-700 text-xs leading-relaxed bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        {item.a}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between">
              <span><strong>Examiner Tip:</strong> Always emphasize that you built a practical, working system rather than a broken, over-complicated theoretical design.</span>
            </div>
          </div>
        );

      // ----------------------------------------------------
      // SLIDE 10: CONCLUSION & DEMO
      // ----------------------------------------------------
      case 9:
        return (
          <div className="h-full bg-slate-900 text-white rounded-2xl p-8 md:p-14 flex flex-col justify-between relative overflow-hidden shadow-2xl border border-slate-800">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold tracking-wide uppercase mb-6">
                <CheckCircle2 className="w-3.5 h-3.5" /> Project Conclusion
              </div>

              <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white mb-4">
                CivicSaathi: Practical, Simple & Reliable
              </h2>

              <p className="text-slate-300 text-sm md:text-base max-w-2xl leading-relaxed mb-6">
                CivicSaathi proves that everyday urban governance can be modernized using clean, reliable web technologies without over-complicating development or maintenance.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl">
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                  <div className="text-emerald-400 font-bold text-sm mb-1">1. Dual Access</div>
                  <p className="text-xs text-slate-400">Separate Citizen & Municipal Officer portals for security and accountability.</p>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                  <div className="text-sky-400 font-bold text-sm mb-1">2. Visual Proof</div>
                  <p className="text-xs text-slate-400">WebRTC live camera & photo gallery uploads clarify exact issue severity.</p>
                </div>
                <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700">
                  <div className="text-amber-400 font-bold text-sm mb-1">3. Verifiable Slips</div>
                  <p className="text-xs text-slate-400">Printable acknowledgement slips with QR codes ensure end-to-end follow-up.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-800/80">
              <div>
                <span className="text-xs text-slate-400 block">Thank you! Ready for Live Demonstration & Questions.</span>
                <span className="text-xs text-emerald-400 font-medium">CivicSaathi: Community Assistance & Redressal Portal</span>
              </div>
              <button
                onClick={handleDownloadPptx}
                disabled={isDownloading}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {isDownloading ? 'Preparing PPTX...' : 'Download PowerPoint (.pptx)'}
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getSpeakerNotes = () => {
    switch (currentSlide) {
      case 0:
        return "Good morning respected examiners. Today I present CivicSaathi, a simple, reliable web platform for community assistance and civic grievance redressal. Our project connects citizens and municipal officers directly to resolve neighborhood issues with photo evidence and digital tracking.";
      case 1:
        return "The problem we are addressing is that traditional civic complaints depend on physical paper registers or unorganized messages. Complaints get lost, there is no photo evidence to judge repair severity, citizens have no tracking number, and officers lack an organized action dashboard.";
      case 2:
        return "CivicSaathi solves this by providing two dedicated portals: a citizen portal where reports can be registered in 60 seconds with photos, and a municipal portal where officers can filter by department, update statuses, and log remarks.";
      case 3:
        return "To keep our system robust, high-performing, and easy to maintain, we scoped it to exactly 5 core modules: Authentication, Grievance Registration, Citizen Tracking, Municipal Action Console, and Digital Receipt Generation.";
      case 4:
        return "Module 1 manages role authentication between citizens and municipal officers. Module 2 handles grievance registration where citizens select a category, write an address, and attach photos using live camera capture or gallery selection.";
      case 5:
        return "Module 3 gives citizens complete tracking with color-coded badges and safe cancellation. Module 4 allows municipal officers to filter complaints by department, review photos, update statuses to Resolved, and write official notes.";
      case 6:
        return "Module 5 is our digital receipt and verification slip feature. Every complaint generates a unique reference code like REP-2026-X8K9, and produces an official printable A4 slip with a QR verification code for offline follow-up.";
      case 7:
        return "For our environment, we use a React frontend, Node.js Express backend, and a 3NF normalized MySQL database schema with users, complaints, and complaint_history tables.";
      case 8:
        return "If examiners ask why we did not use heavy AI, we explain that our priority is practical reliability and instant performance. Human photo evidence is 100% accurate and requires no expensive GPU infrastructure.";
      case 9:
        return "In conclusion, CivicSaathi delivers a practical, working solution that solves a real civic problem without unnecessary complexity. I am now excited to demonstrate the live application. Thank you!";
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col justify-between p-3 md:p-6 overflow-hidden">
      {/* Top Header Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-white shrink-0 mb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-bold text-sm text-slate-100">CivicSaathi Presentation Deck</span>
          </div>
          <span className="hidden md:inline text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
            Slide {currentSlide + 1} of {totalSlides}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Speaker Notes Toggle */}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              showNotes ? 'bg-sky-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
            title="Toggle Speaker Talking Points"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Speaker Script</span>
          </button>

          {/* Download PPTX File */}
          <button
            onClick={handleDownloadPptx}
            disabled={isDownloading}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            title="Download PowerPoint (.pptx) File"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isDownloading ? 'Downloading...' : 'Download .PPTX'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Close Modal */}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer ml-1"
            title="Close Presentation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Slide Stage */}
      <div className="flex-1 flex flex-col relative min-h-0 overflow-hidden">
        <div className="flex-1 min-h-0">
          {renderSlideContent()}
        </div>

        {/* Floating Speaker Notes Panel */}
        {showNotes && (
          <div className="absolute bottom-4 left-4 right-4 md:left-12 md:right-12 bg-slate-900/95 text-slate-200 border border-slate-700 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2 duration-200 z-10">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" /> Speaker Talking Points (Viva / Presentation):
              </span>
              <button
                onClick={() => setShowNotes(false)}
                className="text-xs text-slate-400 hover:text-white cursor-pointer"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed italic">
              "{getSpeakerNotes()}"
            </p>
          </div>
        )}
      </div>

      {/* Bottom Controls Bar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between text-white shrink-0 mt-3">
        {/* Previous Button */}
        <button
          onClick={() => setCurrentSlide((prev) => Math.max(prev - 1, 0))}
          disabled={currentSlide === 0}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
            currentSlide === 0
              ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
              : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        {/* Slide Dots / Thumbnails */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-[50%] px-2 py-1 scrollbar-none">
          {Array.from({ length: totalSlides }).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                currentSlide === idx ? 'w-6 bg-emerald-500' : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              title={`Go to Slide ${idx + 1}`}
            />
          ))}
        </div>

        {/* Next Button */}
        <button
          onClick={() => setCurrentSlide((prev) => Math.min(prev + 1, totalSlides - 1))}
          disabled={currentSlide === totalSlides - 1}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
            currentSlide === totalSlides - 1
              ? 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500'
              : 'bg-emerald-600 text-white hover:bg-emerald-500'
          }`}
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
