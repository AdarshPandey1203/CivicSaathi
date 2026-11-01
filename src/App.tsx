import React, { useState, useEffect } from 'react';
import { UserAccount, GovAccount, CivicReport, ReportStatus } from './types';
import { INITIAL_REPORTS } from './data/mockReports';
import { AuthPage } from './components/AuthPage';
import { UserPortal } from './components/UserPortal';
import { GovPortal } from './components/GovPortal';
import { PresentationModal } from './components/PresentationModal';

const STORAGE_KEY = 'civicsaathi_reports_v2';
const USER_KEY = 'civicsaathi_active_user_v2';
const GOV_KEY = 'civicsaathi_active_gov_v2';

export default function App() {
  const [isPresentationOpen, setIsPresentationOpen] = useState(false);

  // Load reports from storage or default initial reports
  const [reports, setReports] = useState<CivicReport[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_REPORTS;
  });

  // Active logged in user/government
  const [activeCitizen, setActiveCitizen] = useState<UserAccount | null>(() => {
    try {
      const saved = localStorage.getItem(USER_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return null;
  });

  const [activeGovOfficer, setActiveGovOfficer] = useState<GovAccount | null>(() => {
    try {
      const saved = localStorage.getItem(GOV_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return null;
  });

  // Save reports on state change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch {
      // Ignore
    }
  }, [reports]);

  // Citizen Login Handler
  const handleCitizenLogin = (user: UserAccount) => {
    setActiveCitizen(user);
    setActiveGovOfficer(null);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(GOV_KEY);
  };

  // Government Login Handler
  const handleGovLogin = (officer: GovAccount) => {
    setActiveGovOfficer(officer);
    setActiveCitizen(null);
    localStorage.setItem(GOV_KEY, JSON.stringify(officer));
    localStorage.removeItem(USER_KEY);
  };

  // Logout Handler
  const handleLogout = () => {
    setActiveCitizen(null);
    setActiveGovOfficer(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(GOV_KEY);
  };

  // Citizen: Create Report Handler
  const handleCreateReport = (newReportData: Partial<CivicReport>) => {
    const year = new Date().getFullYear();
    const rand = Math.floor(1000 + Math.random() * 9000);
    const refNo = `CS-${year}-${rand}`;
    const id = `rep-${Date.now()}`;

    const newReport: CivicReport = {
      id,
      referenceNo: refNo,
      userId: newReportData.userId || 'usr-default',
      userName: newReportData.userName || 'Citizen',
      userEmail: newReportData.userEmail || 'citizen@civicsaathi.in',
      userPhone: newReportData.userPhone || '+91 98765 43210',
      title: newReportData.title || 'Civic Issue',
      category: newReportData.category || 'potholes',
      categoryLabel: newReportData.categoryLabel || 'Potholes & Road Damage',
      department: newReportData.department || 'Public Works Department (PWD)',
      description: newReportData.description || '',
      area: newReportData.area || 'Green Valley Ward 14',
      addressLandmark: newReportData.addressLandmark || '',
      urgency: newReportData.urgency || 'Medium',
      imageUrl: newReportData.imageUrl,
      status: 'Submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      timeline: [
        {
          id: `t-${Date.now()}`,
          status: 'Submitted',
          updatedBy: `${newReportData.userName || 'Citizen'} (Reporter)`,
          department: 'Citizen Portal',
          remarks: 'Report registered with photo and location landmark.',
          timestamp: new Date().toISOString(),
        },
      ],
    };

    setReports((prev) => [newReport, ...prev]);
  };

  // Government: Update Report Status Handler
  const handleUpdateStatus = (
    reportId: string,
    newStatus: ReportStatus,
    remarks: string,
    assignedOfficer?: string,
    resolvedImageUrl?: string
  ) => {
    setReports((prev) =>
      prev.map((r) => {
        if (r.id !== reportId) return r;

        const timelineEntry = {
          id: `t-${Date.now()}`,
          status: newStatus,
          updatedBy: activeGovOfficer?.name || 'Department Officer',
          department: activeGovOfficer?.department || r.department,
          remarks,
          evidenceImage: resolvedImageUrl,
          timestamp: new Date().toISOString(),
        };

        return {
          ...r,
          status: newStatus,
          assignedOfficer: assignedOfficer || r.assignedOfficer,
          resolvedImageUrl: resolvedImageUrl || r.resolvedImageUrl,
          updatedAt: new Date().toISOString(),
          timeline: [timelineEntry, ...r.timeline],
        };
      })
    );
  };

  // Delete Report Handler (used by both Citizen and Department)
  const handleDeleteReport = (reportId: string) => {
    setReports((prev) => prev.filter((r) => r.id !== reportId));
  };

  // Screen Routing with Global Presentation Deck Modal
  return (
    <>
      {activeCitizen ? (
        <UserPortal
          user={activeCitizen}
          reports={reports}
          onLogout={handleLogout}
          onCreateReport={handleCreateReport}
          onDeleteReport={handleDeleteReport}
          onOpenPresentation={() => setIsPresentationOpen(true)}
        />
      ) : activeGovOfficer ? (
        <GovPortal
          officer={activeGovOfficer}
          reports={reports}
          onLogout={handleLogout}
          onUpdateStatus={handleUpdateStatus}
          onDeleteReport={handleDeleteReport}
          onOpenPresentation={() => setIsPresentationOpen(true)}
        />
      ) : (
        <AuthPage
          onCitizenLogin={handleCitizenLogin}
          onGovLogin={handleGovLogin}
          onOpenPresentation={() => setIsPresentationOpen(true)}
        />
      )}

      {/* Fullscreen Interactive Presentation Deck Modal */}
      <PresentationModal
        isOpen={isPresentationOpen}
        onClose={() => setIsPresentationOpen(false)}
      />
    </>
  );
}
