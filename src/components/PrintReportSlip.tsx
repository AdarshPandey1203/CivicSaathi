import React from 'react';
import { CivicReport } from '../types';
import {
  Printer,
  X,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';

interface PrintReportSlipProps {
  report: CivicReport;
  onClose: () => void;
}

export const PrintReportSlip: React.FC<PrintReportSlipProps> = ({ report, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6 print:border-none print:shadow-none print:my-0 print:max-w-none">
        {/* Screen Toolbar (Hidden when printing) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <span className="font-bold text-sm">Official Civic Grievance & Resolution Document</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Sheet (A4 Styled) */}
        <div className="p-8 sm:p-10 space-y-6 bg-white text-slate-900 font-sans print:p-6" id="printable-slip">
          {/* Official Letterhead */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-lg">
                    CS
                  </div>
                  <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase">
                      CivicSaathi
                    </h1>
                    <p className="text-[11px] font-semibold text-slate-600">
                      Municipal Public Grievance & Issue Resolution System
                    </p>
                  </div>
                </div>
              </div>

              {/* Reference & Barcode Box */}
              <div className="text-right">
                <div className="text-[10px] uppercase font-bold text-slate-500">
                  Official Reference Number
                </div>
                <div className="text-lg font-mono font-black text-slate-900 tracking-wider">
                  {report.referenceNo}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Filing Date: {new Date(report.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs bg-slate-100 p-2.5 rounded-lg border border-slate-200">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-700">Handling Department:</span>
                <span className="font-bold text-slate-900">{report.department}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700">Current Status:</span>
                <span className="px-2.5 py-0.5 rounded font-black text-xs uppercase bg-white border border-slate-300">
                  {report.status}
                </span>
              </div>
            </div>
          </div>

          {/* Citizen & Location Data Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Citizen / Complainant Information
              </div>
              <div className="text-sm font-bold text-slate-900">{report.userName}</div>
              <div className="text-slate-600">Email: {report.userEmail}</div>
              {report.userPhone && <div className="text-slate-600">Phone: {report.userPhone}</div>}
              <div className="text-slate-600">Ward/Area: {report.area}</div>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Incident Location & Priority
              </div>
              <div className="text-sm font-bold text-slate-900">{report.categoryLabel}</div>
              <div className="text-slate-600">Landmark: {report.addressLandmark || 'Not specified'}</div>
              <div className="text-slate-600">Area: {report.area}</div>
              <div className="text-slate-600">
                Urgency: <span className="font-bold">{report.urgency} Priority</span>
              </div>
            </div>
          </div>

          {/* Issue Description */}
          <div className="space-y-1.5 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Complaint Title & Detailed Description
            </div>
            <div className="text-sm font-bold text-slate-900">{report.title}</div>
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/30 text-slate-700 leading-relaxed">
              {report.description}
            </div>
          </div>

          {/* Photographic Evidence (Before & After) */}
          {(report.imageUrl || report.resolvedImageUrl) && (
            <div className="space-y-2">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Photographic Evidence Record
              </div>
              <div className="grid grid-cols-2 gap-4">
                {report.imageUrl && (
                  <div className="border border-slate-200 rounded-xl p-2 bg-slate-50">
                    <div className="text-[10px] font-bold text-slate-600 mb-1">
                      1. Initial Incident Photo (Before Repair)
                    </div>
                    <img
                      src={report.imageUrl}
                      alt="Initial incident"
                      className="w-full h-40 object-cover rounded-lg border border-slate-200"
                    />
                  </div>
                )}
                {report.resolvedImageUrl && (
                  <div className="border border-emerald-300 rounded-xl p-2 bg-emerald-50/40">
                    <div className="text-[10px] font-bold text-emerald-800 mb-1 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>2. Department Repair Proof (After Resolution)</span>
                    </div>
                    <img
                      src={report.resolvedImageUrl}
                      alt="Resolution proof"
                      className="w-full h-40 object-cover rounded-lg border border-emerald-200"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Official Department Action History Timeline */}
          <div className="space-y-2 text-xs">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Official Department Action Log & Audit History
            </div>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden">
              {report.timeline.map((entry, idx) => (
                <div key={entry.id || idx} className="p-2.5 flex items-start justify-between gap-3 text-[11px]">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 uppercase">{entry.status}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-600 font-semibold">{entry.updatedBy}</span>
                      <span className="text-slate-400">({entry.department})</span>
                    </div>
                    <p className="text-slate-700 mt-0.5">{entry.remarks}</p>
                  </div>
                  <div className="text-slate-500 whitespace-nowrap text-[10px]">
                    {new Date(entry.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signature & Authentication Footer */}
          <div className="pt-6 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <div className="flex items-center gap-2 text-emerald-700 font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Digital Municipal Grievance Record</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal">
                This document is generated by CivicSaathi. The reference number is cryptographically tracked in the municipal civic registry.
              </p>
            </div>

            <div className="text-right space-y-4">
              <div className="inline-block border-b border-slate-400 w-44 h-8"></div>
              <div className="text-[11px] font-bold text-slate-800">
                Authorized Municipal Officer / Engineer Signature
              </div>
              <div className="text-[10px] text-slate-500">
                Printed: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
