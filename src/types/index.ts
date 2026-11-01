export type AccountType = 'citizen' | 'government';

export type ReportCategory =
  | 'potholes'
  | 'garbage'
  | 'drainage'
  | 'water_leakage'
  | 'streetlight'
  | 'public_facility';

export type ReportStatus = 'Submitted' | 'In Progress' | 'Resolved' | 'Rejected';

export type UrgencyLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'citizen';
  wardOrArea: string;
}

export interface GovAccount {
  id: string;
  name: string;
  email: string;
  role: 'government';
  department: string;
  officialId: string;
  designation: string;
}

export interface StatusTimelineEntry {
  id: string;
  status: ReportStatus;
  updatedBy: string;
  department: string;
  remarks: string;
  evidenceImage?: string;
  timestamp: string;
}

export interface CivicReport {
  id: string;
  referenceNo: string; // e.g. CS-2026-8492
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  title: string;
  category: ReportCategory;
  categoryLabel: string;
  department: string;
  description: string;
  area: string;
  addressLandmark: string;
  latitude?: number;
  longitude?: number;
  urgency: UrgencyLevel;
  imageUrl?: string;
  resolvedImageUrl?: string;
  status: ReportStatus;
  assignedOfficer?: string;
  createdAt: string;
  updatedAt: string;
  timeline: StatusTimelineEntry[];
}
