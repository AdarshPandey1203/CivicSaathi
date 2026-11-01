import React, { useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  LogOut,
  MapPin,
  Send,
  Eye,
  FileCheck,
  X,
  Phone,
  Mail,
  User,
  ShieldAlert,
  Download,
  Printer,
  ChevronRight,
  ShieldCheck,
  Trash2,
  BellRing,
} from 'lucide-react';
import { GovAccount, CivicReport, ReportStatus } from '../types';
import { CameraAndGalleryPicker } from './CameraAndGalleryPicker';
import { PrintReportSlip } from './PrintReportSlip';
import { sendMockEmailNotification } from '../services/notificationService';

interface GovPortalProps {
  officer: GovAccount;
  reports: CivicReport[];
  onLogout: () => void;
  onUpdateStatus: (
    reportId: string,
    newStatus: ReportStatus,
    remarks: string,
    assignedOfficer?: string,
    resolvedImageUrl?: string
  ) => void;
  onDeleteReport: (reportId: string) => void;
  onOpenPresentation?: () => void;
}

export const GovPortal: React.FC<GovPortalProps> = ({
  officer,
  reports,
  onLogout,
  onUpdateStatus,
  onDeleteReport,
  onOpenPresentation,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [activeReport, setActiveReport] = useState<CivicReport | null>(null);
  const [reportToPrint, setReportToPrint] = useState<CivicReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<CivicReport | null>(null);

  // Status Update Form State
  const [newStatus, setNewStatus] = useState<ReportStatus>('In Progress');
  const [assignedCrew, setAssignedCrew] = useState('');
  const [officialRemarks, setOfficialRemarks] = useState('');
  const [repairPhotoUrl, setRepairPhotoUrl] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  // Notification Toast State
  const [notificationToast, setNotificationToast] = useState<{
    message: string;
    recipient: string;
    status: ReportStatus;
  } | null>(null);

  // Filtering
  const filteredReports = reports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || r.status === selectedStatus;
    const matchesDept = selectedDept === 'all' || r.department === selectedDept;
    return matchesSearch && matchesStatus && matchesDept;
  });

  const handleOpenUpdate = (report: CivicReport) => {
    setActiveReport(report);
    setNewStatus(report.status === 'Submitted' ? 'In Progress' : report.status);
    setAssignedCrew(report.assignedOfficer || `${officer.name} (${officer.department})`);
    setOfficialRemarks('');
    setRepairPhotoUrl(report.resolvedImageUrl || '');
    setActionError(null);
  };

  const handleSaveStatusUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);

    const remarks = officialRemarks.trim();
    if (!remarks || remarks.length < 5) {
      setActionError('Please provide official action remarks (at least 5 characters).');
      return;
    }

    if (!activeReport) return;

    // 1. Trigger simulated email notification service (logs confirmation to console)
    const emailResult = sendMockEmailNotification(
      activeReport,
      newStatus,
      remarks,
      officer,
      Boolean(repairPhotoUrl)
    );

    // 2. Perform state update
    onUpdateStatus(
      activeReport.id,
      newStatus,
      remarks,
      assignedCrew.trim() || `${officer.name} (${officer.department})`,
      repairPhotoUrl || undefined
    );

    // 3. Show visual confirmation of dispatched notification
    setNotificationToast({
      message: `Status updated to "${newStatus}". Mock email notification dispatched to citizen (${emailResult.recipient}). Check developer console for payload log.`,
      recipient: emailResult.recipient,
      status: newStatus,
    });
    setTimeout(() => setNotificationToast(null), 5000);

    setActiveReport(null);
    setOfficialRemarks('');
    setRepairPhotoUrl('');
    setActionError(null);
  };

  const confirmDeleteReport = () => {
    if (!reportToDelete) return;
    const refNo = reportToDelete.referenceNo;
    onDeleteReport(reportToDelete.id);
    if (activeReport?.id === reportToDelete.id) {
      setActiveReport(null);
    }
    setReportToDelete(null);
  };

  const exportToCSV = () => {
    const headers = [
      'Reference No',
      'Title',
      'Category',
      'Citizen Name',
      'Citizen Phone',
      'Area',
      'Department',
      'Status',
      'Created At',
      'Updated At',
    ];

    const rows = filteredReports.map((r) => [
      `"${r.referenceNo}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.categoryLabel}"`,
      `"${r.userName}"`,
      `"${r.userPhone || ''}"`,
      `"${r.area.replace(/"/g, '""')}"`,
      `"${r.department}"`,
      `"${r.status}"`,
      `"${r.createdAt}"`,
      `"${r.updatedAt}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CivicSaathi_Reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'Submitted':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'In Progress':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Resolved':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Real-time Email Notification Confirmation Toast */}
      {notificationToast && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white max-w-md p-4 rounded-xl shadow-2xl border border-emerald-500/40 animate-fade-in space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
            <BellRing className="w-4 h-4 animate-bounce" />
            <span>Mock Email Notification Triggered</span>
          </div>
          <p className="text-[11px] text-slate-200 leading-normal">
            {notificationToast.message}
          </p>
          <div className="text-[10px] text-slate-400 font-mono pt-1">
            Logged to console via [CivicSaathi Email Service]
          </div>
        </div>
      )}

      {/* Top Navbar for Government Portal */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black text-sm shadow-xs">
              GOV
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight leading-tight">
                CivicSaathi
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                Government & Department Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenPresentation && (
              <button
                onClick={onOpenPresentation}
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="View & Download PowerPoint Deck"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Presentation (PPT)</span>
              </button>
            )}

            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-white">{officer.name}</div>
              <div className="text-[11px] text-slate-400">
                {officer.designation} · {officer.department}
              </div>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Government Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Officer Header Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Official Department Console
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono">
                Official ID: {officer.officialId}
              </span>
            </div>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              {officer.department}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review incoming citizen reports, dispatch municipal repair teams, upload work completion photo evidence, and record verified status updates.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <button
              type="button"
              onClick={exportToCSV}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <div className="text-xs text-slate-600 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200">
              <div>Signed in: <strong>{officer.name}</strong></div>
              <div className="text-[11px] text-slate-400">{officer.email}</div>
            </div>
          </div>
        </div>

        {/* Aggregate KPI Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">Total Reports</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{reports.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-blue-600 uppercase">Pending Review</div>
            <div className="text-2xl font-black text-blue-700 mt-1">
              {reports.filter((r) => r.status === 'Submitted').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-amber-600 uppercase">In Progress</div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {reports.filter((r) => r.status === 'In Progress').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-emerald-600 uppercase">Resolved</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {reports.filter((r) => r.status === 'Resolved').length}
            </div>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ref no, citizen, or issue..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden text-slate-700 bg-white"
            >
              <option value="all">All Report Statuses</option>
              <option value="Submitted">Submitted (New / Pending)</option>
              <option value="In Progress">In Progress (Work Dispatched)</option>
              <option value="Resolved">Resolved (Completed)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden text-slate-700 bg-white"
            >
              <option value="all">All Municipal Departments</option>
              <option value="Public Works Department (PWD)">Public Works Department (PWD)</option>
              <option value="Solid Waste Management Department">Solid Waste Management</option>
              <option value="Sanitation & Drainage Board">Sanitation & Drainage Board</option>
              <option value="Water Supply & Sewerage Board">Water Supply & Sewerage Board</option>
              <option value="Electrical & Public Lighting Department">Electrical & Public Lighting</option>
              <option value="Municipal Parks & Facility Department">Municipal Parks & Facility</option>
            </select>
          </div>
        </div>

        {/* Reports Table / List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">
              Citizen Reports Queue ({filteredReports.length})
            </h2>
            <span className="text-xs text-slate-500">
              Click "Review & Update" to change status, email citizen, or attach repair proof
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold uppercase text-[10px]">
                <tr>
                  <th className="px-4 py-3">Ref No</th>
                  <th className="px-4 py-3">Citizen Info</th>
                  <th className="px-4 py-3">Problem Title & Category</th>
                  <th className="px-4 py-3">Area / Landmark</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-400">
                      No citizen reports match current filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredReports.map((report) => (
                    <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {report.referenceNo}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-800">{report.userName}</div>
                        <div className="text-[10px] text-slate-400">{report.userPhone || report.userEmail}</div>
                      </td>
                      <td className="px-4 py-3 max-w-xs">
                        <div className="font-semibold text-slate-800 truncate">{report.title}</div>
                        <div className="text-[10px] text-slate-500">{report.categoryLabel}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-slate-700 font-medium">{report.area}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                          {report.addressLandmark}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-700 whitespace-nowrap">
                        {report.department}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2.5 py-1 rounded-md border font-bold text-[11px] capitalize ${getStatusBadge(report.status)}`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Print Slip Action */}
                          <button
                            type="button"
                            onClick={() => setReportToPrint(report)}
                            title="Print Municipal Case File"
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {/* Delete Report Action */}
                          <button
                            type="button"
                            onClick={() => setReportToDelete(report)}
                            title="Delete / Remove from Queue"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          {/* Review & Update Action */}
                          <button
                            onClick={() => handleOpenUpdate(report)}
                            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                          >
                            Review & Update
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL 1: GOVERNMENT STATUS UPDATE FORM */}
      {activeReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 p-6 my-8 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-mono font-bold text-slate-900">{activeReport.referenceNo}</span>
                  <span aria-hidden="true">·</span>
                  <span>{activeReport.categoryLabel}</span>
                  <span aria-hidden="true">·</span>
                  <span>Reported by {activeReport.userName}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{activeReport.title}</h3>
              </div>
              <button
                onClick={() => setActiveReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {actionError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Citizen Submission Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500 font-medium">Citizen Contact:</span>
                <div className="font-semibold text-slate-800">{activeReport.userName} ({activeReport.userPhone})</div>
                <div className="text-slate-500 text-[11px]">{activeReport.userEmail}</div>
              </div>
              <div>
                <span className="text-slate-500 font-medium">Location:</span>
                <div className="font-semibold text-slate-800">{activeReport.area}</div>
                <div className="text-slate-500 text-[11px]">{activeReport.addressLandmark}</div>
              </div>
              <div className="sm:col-span-2 pt-1 border-t border-slate-200">
                <span className="text-slate-500 font-medium">Description:</span>
                <p className="text-slate-700 mt-0.5">{activeReport.description}</p>
              </div>
            </div>

            {/* Initial Citizen Photo Evidence */}
            {activeReport.imageUrl && (
              <div className="space-y-1">
                <div className="text-[11px] font-bold text-slate-600">
                  Citizen Incident Evidence Photo:
                </div>
                <img
                  src={activeReport.imageUrl}
                  alt={activeReport.title}
                  className="w-full h-44 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}

            {/* Government Status Update Action */}
            <form onSubmit={handleSaveStatusUpdate} className="space-y-4 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Update Report Status & Action Remarks
                </h4>
                <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Will trigger mock citizen email</span>
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Status *
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as ReportStatus)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 bg-white text-slate-800 font-bold"
                  >
                    <option value="In Progress">In Progress (Dispatch Team)</option>
                    <option value="Resolved">Resolved (Work Completed)</option>
                    <option value="Rejected">Rejected (Out of Scope / Invalid)</option>
                    <option value="Submitted">Submitted (Keep Pending)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Assigned Field Gang / Officer
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ward Road Repair Gang #4"
                    value={assignedCrew}
                    onChange={(e) => setAssignedCrew(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Department Remarks *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Record action taken (e.g. Inspected site, replaced damaged pipeline collar, pothole filled with asphalt)..."
                  value={officialRemarks}
                  onChange={(e) => setOfficialRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Official Repair Proof Photo (Camera / Gallery) */}
              <CameraAndGalleryPicker
                currentImageUrl={repairPhotoUrl}
                onImageSelected={(url) => setRepairPhotoUrl(url)}
                onImageRemoved={() => setRepairPhotoUrl('')}
                label="Official Repair / Resolution Proof Photo (Take Photo with Camera or Upload from Gallery)"
              />

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReportToPrint(activeReport)}
                    className="px-3 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-emerald-700" />
                    <span>Print Slip</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReportToDelete(activeReport)}
                    className="px-3 py-2 border border-rose-200 hover:bg-rose-50 text-rose-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReport(null)}
                    className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Save & Notify Citizen</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE MODAL */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Report from Municipal Queue?</h3>
                <p className="text-xs text-slate-500 font-mono">{reportToDelete.referenceNo}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently remove "<strong>{reportToDelete.title}</strong>"?
              This will erase the record from the departmental queue and citizen portal.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReportToDelete(null)}
                className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteReport}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
              >
                Yes, Delete Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: DEDICATED PRINT SLIP */}
      {reportToPrint && (
        <PrintReportSlip
          report={reportToPrint}
          onClose={() => setReportToPrint(null)}
        />
      )}
    </div>
  );
};
