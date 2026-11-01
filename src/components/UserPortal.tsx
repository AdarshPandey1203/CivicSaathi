import React, { useState } from 'react';
import {
  User,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Camera,
  X,
  LogOut,
  ChevronRight,
  ShieldAlert,
  FileText,
  Building2,
  Calendar,
  Search,
  Filter,
  Printer,
  Check,
  Trash2,
} from 'lucide-react';
import { UserAccount, CivicReport, ReportCategory, UrgencyLevel, ReportStatus } from '../types';
import { CameraAndGalleryPicker } from './CameraAndGalleryPicker';
import { PrintReportSlip } from './PrintReportSlip';

interface UserPortalProps {
  user: UserAccount;
  reports: CivicReport[];
  onLogout: () => void;
  onCreateReport: (newReport: Partial<CivicReport>) => void;
  onDeleteReport: (reportId: string) => void;
  onOpenPresentation?: () => void;
}

const CATEGORY_MAP: Record<ReportCategory, { label: string; department: string }> = {
  potholes: { label: 'Potholes & Road Damage', department: 'Public Works Department (PWD)' },
  garbage: { label: 'Garbage & Waste Accumulation', department: 'Solid Waste Management Department' },
  drainage: { label: 'Drainage & Sewage Overflow', department: 'Sanitation & Drainage Board' },
  water_leakage: { label: 'Drinking Water Pipe Leakage', department: 'Water Supply & Sewerage Board' },
  streetlight: { label: 'Broken Streetlight & Dark Spots', department: 'Electrical & Public Lighting Department' },
  public_facility: { label: 'Public Facility & Park Damage', department: 'Municipal Parks & Facility Department' },
};

const SAMPLE_PHOTOS = [
  { label: 'Pothole on Road', url: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80' },
  { label: 'Garbage Dump', url: 'https://images.unsplash.com/photo-1605600659908-0ef719419d41?auto=format&fit=crop&w=800&q=80' },
  { label: 'Water Pipe Leak', url: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80' },
  { label: 'Broken Streetlight', url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80' },
];

export const UserPortal: React.FC<UserPortalProps> = ({
  user,
  reports,
  onLogout,
  onCreateReport,
  onDeleteReport,
  onOpenPresentation,
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CivicReport | null>(null);
  const [reportToPrint, setReportToPrint] = useState<CivicReport | null>(null);
  const [reportToDelete, setReportToDelete] = useState<CivicReport | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [gpsNotice, setGpsNotice] = useState<string | null>(null);
  const [formValidationNotice, setFormValidationNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'potholes' as ReportCategory,
    area: user.wardOrArea || 'Green Valley Ward 14',
    addressLandmark: '',
    urgency: 'Medium' as UrgencyLevel,
    description: '',
    imageUrl: '',
  });

  const userReports = reports.filter(
    (r) => r.userId === user.id || r.userEmail === user.email || r.userName === user.name
  );

  const filteredUserReports = userReports.filter((r) => {
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.referenceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.area.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDetectGPS = () => {
    setGpsNotice(null);
    if (!navigator.geolocation) {
      setGpsNotice('Geolocation is not supported by your browser.');
      return;
    }
    setGpsNotice('Detecting coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos.coords.latitude.toFixed(5));
        const lng = Number(pos.coords.longitude.toFixed(5));
        setFormData((prev) => ({
          ...prev,
          area: `${prev.area.split(' (GPS:')[0]} (GPS: ${lat}, ${lng})`,
        }));
        setGpsNotice(`GPS Coordinates acquired: ${lat}, ${lng}`);
      },
      (err) => {
        setGpsNotice('Unable to acquire GPS position. You can manually enter street or landmark.');
      },
      { timeout: 10000 }
    );
  };

  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationNotice(null);

    const title = formData.title.trim();
    const description = formData.description.trim();

    if (!title || title.length < 5) {
      setFormValidationNotice('Please provide a descriptive title (at least 5 characters).');
      return;
    }
    if (!description || description.length < 10) {
      setFormValidationNotice('Please provide at least 10 characters in the description.');
      return;
    }

    const catInfo = CATEGORY_MAP[formData.category];
    onCreateReport({
      ...formData,
      title,
      description,
      categoryLabel: catInfo.label,
      department: catInfo.department,
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.phone,
    });

    setShowCreateModal(false);
    setFormData({
      title: '',
      category: 'potholes',
      area: user.wardOrArea || 'Green Valley Ward 14',
      addressLandmark: '',
      urgency: 'Medium',
      description: '',
      imageUrl: '',
    });
    setGpsNotice(null);
    setFormValidationNotice(null);
    showToast('Report successfully registered! Routed to municipal department.');
  };

  const confirmDeleteReport = () => {
    if (!reportToDelete) return;
    const refNo = reportToDelete.referenceNo;
    onDeleteReport(reportToDelete.id);
    if (selectedReport?.id === reportToDelete.id) {
      setSelectedReport(null);
    }
    setReportToDelete(null);
    showToast(`Report ${refNo} has been deleted.`);
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-semibold animate-fade-in border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar for Citizen Portal */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              CS
            </div>
            <div>
              <div className="font-extrabold text-base text-slate-900 leading-tight">
                CivicSaathi
              </div>
              <div className="text-[11px] text-emerald-700 font-semibold">
                Citizen Portal
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onOpenPresentation && (
              <button
                onClick={onOpenPresentation}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                title="View & Download PowerPoint Deck"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Presentation (PPT)</span>
              </button>
            )}

            <div className="hidden sm:block text-right">
              <div className="text-xs font-bold text-slate-900">{user.name}</div>
              <div className="text-[11px] text-slate-500">{user.wardOrArea}</div>
            </div>

            <button
              onClick={onLogout}
              className="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Citizen Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Welcome & Register Action Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              Citizen Dashboard
            </span>
            <h1 className="text-xl font-bold text-slate-900 mt-1">
              Welcome, {user.name}
            </h1>
            <p className="text-xs text-slate-600 mt-1 max-w-xl">
              Register civic complaints in your neighborhood (potholes, water leaks, garbage, dark streetlights) using your Camera or Photo Gallery and track official municipal resolution.
            </p>
          </div>

          <button
            onClick={() => {
              setShowCreateModal(true);
              setFormValidationNotice(null);
            }}
            className="px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-2 self-start md:self-auto shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Register a Report</span>
          </button>
        </div>

        {/* Quick KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-slate-500 uppercase">My Reports</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{userReports.length}</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-blue-600 uppercase">Submitted</div>
            <div className="text-2xl font-black text-blue-700 mt-1">
              {userReports.filter((r) => r.status === 'Submitted').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-amber-600 uppercase">In Progress</div>
            <div className="text-2xl font-black text-amber-700 mt-1">
              {userReports.filter((r) => r.status === 'In Progress').length}
            </div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="text-[11px] font-semibold text-emerald-600 uppercase">Resolved</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">
              {userReports.filter((r) => r.status === 'Resolved').length}
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search my reports by reference number, issue, or street..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden text-slate-700 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="Submitted">Submitted (New)</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Registered Reports List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">My Registered Civic Reports</h2>
              <p className="text-xs text-slate-500">Track progress, print case slips, and manage your submissions</p>
            </div>
            <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              {filteredUserReports.length} of {userReports.length} reports
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredUserReports.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <FileText className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="text-sm font-bold text-slate-900">
                  {userReports.length === 0 ? 'No reports registered yet' : 'No matching reports found'}
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  {userReports.length === 0
                    ? 'Click "+ Register a Report" to submit road damage, garbage, or water leaks with live camera photo.'
                    : 'Try clearing your search query or status filter.'}
                </p>
                {userReports.length === 0 && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    Register First Report
                  </button>
                )}
              </div>
            ) : (
              filteredUserReports.map((report) => (
                <div
                  key={report.id}
                  className="p-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div
                    onClick={() => setSelectedReport(report)}
                    className="flex items-start gap-4 flex-1 cursor-pointer"
                  >
                    {report.imageUrl && (
                      <img
                        src={report.imageUrl}
                        alt={report.title}
                        className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                      />
                    )}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-mono font-bold text-slate-900">{report.referenceNo}</span>
                        <span aria-hidden="true">·</span>
                        <span>{report.categoryLabel}</span>
                        <span aria-hidden="true">·</span>
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 hover:text-emerald-700 transition-colors">
                        {report.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {report.area}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>Dept: <strong>{report.department}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 sm:self-center self-start">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-lg border capitalize ${getStatusBadge(
                        report.status
                      )}`}
                    >
                      {report.status}
                    </span>

                    {/* Quick Print Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportToPrint(report);
                      }}
                      title="Print Report Slip"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                    </button>

                    {/* Quick Delete Action */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setReportToDelete(report);
                      }}
                      title="Delete Report"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>

                    {/* View Details Action */}
                    <button
                      onClick={() => setSelectedReport(report)}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 ml-1 cursor-pointer"
                    >
                      <span>Details</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </main>

      {/* MODAL 1: REGISTER REPORT FORM */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-200 p-6 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Register a Civic Report</h3>
                <p className="text-xs text-slate-500">Submit a municipal problem for official department resolution</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formValidationNotice && (
              <div className="mt-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{formValidationNotice}</span>
              </div>
            )}

            <form onSubmit={handleSubmitReport} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Report Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep pothole causing accidents near metro exit"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Problem Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ReportCategory })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 bg-white text-slate-800"
                  >
                    <option value="potholes">Potholes & Road Damage</option>
                    <option value="garbage">Garbage & Waste Accumulation</option>
                    <option value="drainage">Drainage & Sewage Overflow</option>
                    <option value="water_leakage">Drinking Water Leakage</option>
                    <option value="streetlight">Broken Streetlights & Dark Spots</option>
                    <option value="public_facility">Public Facility & Park Damage</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Urgency Level
                  </label>
                  <select
                    value={formData.urgency}
                    onChange={(e) => setFormData({ ...formData, urgency: e.target.value as UrgencyLevel })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600 bg-white text-slate-800"
                  >
                    <option value="Low">Low - Minor inconvenience</option>
                    <option value="Medium">Medium - Regular street repair</option>
                    <option value="High">High - Vehicle or safety hazard</option>
                    <option value="Critical">Critical - Urgent public danger</option>
                  </select>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600">
                Routed to: <strong>{CATEGORY_MAP[formData.category].department}</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Area / Ward *
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      className="text-[11px] text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>Detect GPS</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.area}
                    onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                  {gpsNotice && (
                    <div className="text-[10px] text-slate-500 mt-1 italic">
                      {gpsNotice}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address / Landmark
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Near Metro Pillar 104"
                    value={formData.addressLandmark}
                    onChange={(e) => setFormData({ ...formData, addressLandmark: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the issue, physical size, risks, and how long it has persisted..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-600"
                />
              </div>

              {/* Camera & Photo Gallery Picker */}
              <CameraAndGalleryPicker
                currentImageUrl={formData.imageUrl}
                onImageSelected={(url) => setFormData({ ...formData, imageUrl: url })}
                onImageRemoved={() => setFormData({ ...formData, imageUrl: '' })}
                label="Attach Latest Photo (Live Camera or Photo Gallery)"
              />

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm & Submit Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: REPORT DETAILS & TIMELINE */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl border border-slate-200 p-6 my-8 space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
                  <span className="font-mono font-bold text-slate-900">{selectedReport.referenceNo}</span>
                  <span aria-hidden="true">·</span>
                  <span>{selectedReport.categoryLabel}</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{selectedReport.title}</h3>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className={`px-3 py-1 rounded-lg border font-bold capitalize ${getStatusBadge(selectedReport.status)}`}>
                Current Status: {selectedReport.status}
              </span>
              <span className="text-slate-600">
                Department: <strong>{selectedReport.department}</strong>
              </span>
            </div>

            {/* Photos: Before & After (if resolved) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {selectedReport.imageUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase">
                    1. Initial Citizen Photo (Before)
                  </span>
                  <img
                    src={selectedReport.imageUrl}
                    alt={selectedReport.title}
                    className="w-full h-36 object-cover rounded-xl border border-slate-200"
                  />
                </div>
              )}

              {selectedReport.resolvedImageUrl && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    2. Department Repair Proof (After)
                  </span>
                  <img
                    src={selectedReport.resolvedImageUrl}
                    alt="Resolved proof"
                    className="w-full h-36 object-cover rounded-xl border border-emerald-300 ring-2 ring-emerald-500/20"
                  />
                </div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <div className="font-semibold text-slate-800">Location Details:</div>
              <div className="text-slate-600">{selectedReport.area} ({selectedReport.addressLandmark})</div>
              <div className="font-semibold text-slate-800 pt-1">Description:</div>
              <div className="text-slate-600 leading-relaxed">{selectedReport.description}</div>
            </div>

            {/* Official Status Timeline */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Official Department Action Timeline
              </h4>
              <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                {selectedReport.timeline.map((entry, idx) => (
                  <div key={entry.id || idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between text-slate-700 font-semibold">
                      <span className="capitalize text-emerald-800 font-bold">{entry.status}</span>
                      <span className="text-[10px] text-slate-500">{new Date(entry.timestamp).toLocaleString()}</span>
                    </div>
                    <div className="text-slate-700">{entry.remarks}</div>
                    <div className="text-[10px] text-slate-500">
                      Updated by: <strong>{entry.updatedBy}</strong> ({entry.department})
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons: Print Report, Delete Report, Close */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setReportToPrint(selectedReport)}
                  className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Print Report Slip</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportToDelete(selectedReport)}
                  className="px-3 py-1.5 border border-rose-200 text-rose-700 hover:bg-rose-50 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Report</span>
                </button>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRM DELETE MODAL */}
      {reportToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Delete Civic Report?</h3>
                <p className="text-xs text-slate-500 font-mono">{reportToDelete.referenceNo}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete "<strong>{reportToDelete.title}</strong>"?
              This will remove the report from your citizen dashboard and withdraw it from the departmental queue.
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

      {/* MODAL 4: DEDICATED PRINT SLIP */}
      {reportToPrint && (
        <PrintReportSlip
          report={reportToPrint}
          onClose={() => setReportToPrint(null)}
        />
      )}
    </div>
  );
};
