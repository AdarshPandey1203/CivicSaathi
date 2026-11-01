/**
 * Mock Notification Service
 * Simulates triggering transactional email alerts to citizens whenever a municipal department
 * officer updates the status of their civic report.
 */

import { CivicReport, ReportStatus, GovAccount } from '../types';

export interface EmailNotificationPayload {
  toEmail: string;
  toName: string;
  referenceNo: string;
  reportTitle: string;
  previousStatus: ReportStatus;
  newStatus: ReportStatus;
  officerName: string;
  officerDepartment: string;
  officialRemarks: string;
  hasResolutionPhoto: boolean;
  timestamp: string;
}

export interface EmailNotificationResult {
  success: boolean;
  messageId: string;
  recipient: string;
  subject: string;
  sentAt: string;
  logSummary: string;
}

/**
 * Helper function to simulate an email notification trigger when a status update occurs in GovPortal.
 * Logs the confirmation message to the console as a mock notification service.
 */
export function sendMockEmailNotification(
  report: CivicReport,
  newStatus: ReportStatus,
  remarks: string,
  officer: GovAccount,
  hasResolutionPhoto: boolean = false
): EmailNotificationResult {
  const timestamp = new Date().toISOString();
  const formattedTime = new Date().toLocaleString();
  const messageId = `msg-cs-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  
  const recipientEmail = report.userEmail || 'citizen@civicsaathi.in';
  const recipientName = report.userName || 'Citizen';
  const subject = `[CivicSaathi] Update on Report ${report.referenceNo}: Status marked as "${newStatus}"`;

  const emailBody = `
==================== [CIVICSAATHI MOCK EMAIL DISPATCH] ====================
Message ID : ${messageId}
Date & Time: ${formattedTime}
To         : "${recipientName}" <${recipientEmail}>
From       : "CivicSaathi Municipal Portal" <notifications@civicsaathi.gov.in>
Reply-To   : ${officer.email || 'support@civicsaathi.gov.in'}
Subject    : ${subject}
---------------------------------------------------------------------------
Dear ${recipientName},

Your civic complaint regarding "${report.title}" (Ref: ${report.referenceNo})
has been updated by the municipal authorities.

STATUS SUMMARY:
  • Previous Status : ${report.status}
  • Current Status  : ${newStatus.toUpperCase()}
  • Handling Dept   : ${officer.department}
  • Officer In Charge: ${officer.name} (${officer.designation || 'Official'})
  • Official ID     : ${officer.officialId}
  • Official Remarks: "${remarks}"
  • Photo Evidence  : ${hasResolutionPhoto ? 'Yes (Resolution verification photo attached)' : 'None'}

LOCATION:
  • Area / Landmark : ${report.area} ${report.addressLandmark ? `(${report.addressLandmark})` : ''}

You can track real-time resolution updates anytime by logging into your
CivicSaathi Citizen Portal with reference number: ${report.referenceNo}.

Thank you for contributing to a better community!
CivicSaathi Citizen Assistance Platform
===========================================================================
  `.trim();

  // 1. Stylized console log for developer visibility
  console.groupCollapsed(
    `%c📧 [CivicSaathi Email Service] Dispatched notification to ${recipientEmail} for Ref: ${report.referenceNo} (${newStatus})`,
    'color: #047857; font-weight: bold; background: #ecfdf5; padding: 4px 8px; border-radius: 4px;'
  );
  console.log(emailBody);
  console.info('Status transition:', `${report.status} ➔ ${newStatus}`);
  console.info('Officer in charge:', `${officer.name} (${officer.department})`);
  console.groupEnd();

  const logSummary = `Notification sent to ${recipientEmail} (${report.referenceNo} ➔ ${newStatus})`;

  return {
    success: true,
    messageId,
    recipient: recipientEmail,
    subject,
    sentAt: timestamp,
    logSummary,
  };
}
