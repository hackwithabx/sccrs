"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

// Base64-encoded SCR shield logo (192x192 PNG)
const SCR_LOGO_BASE64 = "data:image/png;base64,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";

interface ReportItem {
  category: string;
  status: "pass" | "warning" | "fail";
  finding: string;
  recommendation: string;
  severity?: "Critical" | "High" | "Medium" | "Low" | "Info";
}

interface ReportData {
  appName: string;
  appUrl: string;
  notes: string;
  score: number;
  passCount: number;
  warnCount: number;
  failCount: number;
  items: ReportItem[];
}

// Helper: Draw section header with green accent bar
function drawSectionHeader(doc: jsPDF, title: string, y: number, margin: number): number {
  doc.setFillColor(16, 185, 129);
  doc.rect(margin, y - 5, 3, 10, "F");
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, margin + 8, y + 2);
  return y + 14;
}

// Helper: Get severity from status
function getSeverity(item: ReportItem): string {
  if (item.severity) return item.severity;
  if (item.status === "fail") return "High";
  if (item.status === "warning") return "Medium";
  return "Low";
}

export function generateSecurityReportPDF(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let y = 20;

  // ---- Header with branding & logo ----
  // Dark header bar
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 48, "F");
  // Green accent line at bottom of header
  doc.setFillColor(16, 185, 129);
  doc.rect(0, 48, pageWidth, 2, "F");

  // Add logo
  try {
    doc.addImage(SCR_LOGO_BASE64, "PNG", margin, 6, 36, 36);
  } catch {
    // Fallback: draw shield icon if image fails
    doc.setFillColor(16, 185, 129);
    doc.circle(margin + 18, 24, 16, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text("SCR", margin + 18, 28, { align: "center" });
  }

  // Company name next to logo
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text("SecureCodeReviews", margin + 42, 20);

  // Tagline
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Application Security Assessment Platform", margin + 42, 28);

  // Website & contact
  doc.setFontSize(8);
  doc.setTextColor(100, 200, 160);
  doc.text("https://securecodereviews.com", margin + 42, 36);
  doc.text("support@securecodereviews.com", margin + 42, 42);

  // Report ID on right
  const reportId = `SCR-${Date.now().toString(36).toUpperCase()}`;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(`Report ID: ${reportId}`, pageWidth - margin, 20, { align: "right" });
  doc.text(`Classification: CONFIDENTIAL`, pageWidth - margin, 27, { align: "right" });

  y = 62;

  // ---- Report Title ----
  doc.setTextColor(30, 30, 30);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Security Assessment Report", margin, y);
  y += 12;

  // ---- Report Metadata Table ----
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  const metaItems = [
    ["Application:", data.appName],
    ["Target URL:", data.appUrl || "N/A"],
    ["Assessment Date:", new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })],
    ["Assessment Type:", "Automated Security Scan"],
    ["Platform:", "SecureCodeReviews.com"],
    ["Report ID:", reportId],
  ];

  // Metadata with light background
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, y - 3, pageWidth - 2 * margin, metaItems.length * 7 + 6, 3, 3, "F");

  metaItems.forEach(([label, value], i) => {
    doc.setTextColor(100, 116, 139); // slate-500
    doc.setFont("helvetica", "bold");
    doc.text(label, margin + 5, y + 4 + i * 7);
    doc.setTextColor(30, 41, 59); // slate-800
    doc.setFont("helvetica", "normal");
    doc.text(value, margin + 45, y + 4 + i * 7);
  });

  y += metaItems.length * 7 + 12;

  // ---- Divider ----
  doc.setDrawColor(16, 185, 129);
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);
  y += 14;

  // ---- Executive Summary ----
  y = drawSectionHeader(doc, "Executive Summary", y, margin);

  // Score display - large circle
  const scoreColor =
    data.score >= 80
      ? [16, 185, 129]  // green
      : data.score >= 60
      ? [234, 179, 8]   // yellow
      : [239, 68, 68];  // red

  // Score circle with ring
  doc.setDrawColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.setLineWidth(2);
  doc.circle(margin + 20, y + 12, 18, "S");
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.circle(margin + 20, y + 12, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text(String(data.score), margin + 20, y + 16, { align: "center" });
  doc.setFontSize(7);
  doc.text("/100", margin + 20, y + 22, { align: "center" });

  // Score label and stats
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 30, 30);
  doc.text("Security Score", margin + 45, y + 5);

  // Risk level badge
  const riskLevel = data.score >= 80 ? "LOW RISK" : data.score >= 60 ? "MEDIUM RISK" : "HIGH RISK";
  const riskX = margin + 45;
  doc.setFillColor(scoreColor[0], scoreColor[1], scoreColor[2]);
  doc.roundedRect(riskX, y + 8, 30, 7, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(riskLevel, riskX + 15, y + 13, { align: "center" });

  // Summary stat boxes
  const statsX = margin + 45;
  doc.setFontSize(9);

  // Passed
  doc.setFillColor(240, 253, 244); // green-50
  doc.roundedRect(statsX, y + 18, 30, 12, 2, 2, "F");
  doc.setTextColor(16, 185, 129);
  doc.setFont("helvetica", "bold");
  doc.text(`✓ ${data.passCount} Passed`, statsX + 3, y + 26);

  // Warnings
  doc.setFillColor(254, 252, 232); // yellow-50
  doc.roundedRect(statsX + 34, y + 18, 35, 12, 2, 2, "F");
  doc.setTextColor(161, 120, 0);
  doc.text(`⚠ ${data.warnCount} Warnings`, statsX + 37, y + 26);

  // Failed
  doc.setFillColor(254, 242, 242); // red-50
  doc.roundedRect(statsX + 73, y + 18, 27, 12, 2, 2, "F");
  doc.setTextColor(239, 68, 68);
  doc.text(`✗ ${data.failCount} Failed`, statsX + 76, y + 26);

  y += 40;

  // Executive summary paragraph
  const summaryText = data.score >= 80
    ? `The assessed application "${data.appName}" demonstrates a strong security posture with a score of ${data.score}/100. The majority of security controls are properly implemented. ${data.warnCount > 0 ? `There are ${data.warnCount} area(s) that could benefit from additional hardening. ` : ""}${data.failCount > 0 ? `${data.failCount} critical finding(s) require immediate attention.` : "No critical vulnerabilities were identified."}`
    : data.score >= 60
    ? `The assessed application "${data.appName}" shows a moderate security posture with a score of ${data.score}/100. While basic security controls are in place, several areas require improvement. ${data.failCount} critical finding(s) and ${data.warnCount} warning(s) were identified that should be addressed to strengthen the application's security posture.`
    : `The assessed application "${data.appName}" has significant security concerns with a score of ${data.score}/100. Multiple critical vulnerabilities and configuration issues were identified. Immediate remediation is strongly recommended to reduce risk exposure. ${data.failCount} critical finding(s) require urgent attention.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  const summaryLines = doc.splitTextToSize(summaryText, pageWidth - 2 * margin);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 5 + 10;

  // ---- Detailed Findings Table ----
  y = drawSectionHeader(doc, "Detailed Findings", y, margin);

  const tableData = data.items.map((item) => [
    item.category,
    getSeverity(item),
    item.status.toUpperCase(),
    item.finding,
    item.recommendation,
  ]);

  autoTable(doc, {
    startY: y,
    head: [["Category", "Severity", "Status", "Finding", "Recommendation"]],
    body: tableData,
    margin: { left: margin, right: margin },
    styles: {
      fontSize: 7.5,
      cellPadding: 3.5,
      textColor: [30, 30, 30], // Always dark text for readability
      lineColor: [226, 232, 240], // slate-200
      lineWidth: 0.3,
    },
    headStyles: {
      fillColor: [15, 23, 42], // slate-900
      textColor: [255, 255, 255], // White text on dark bg
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50 (light background)
      textColor: [30, 30, 30], // Dark text for contrast
    },
    },
    columnStyles: {
      0: { cellWidth: 28, fontStyle: "bold" },
      1: { cellWidth: 18, halign: "center", fontSize: 7 },
      2: { cellWidth: 16, halign: "center" },
      3: { cellWidth: 52 },
      4: { cellWidth: 52 },
    },
    didParseCell: (hookData) => {
      if (hookData.section === "body" && hookData.column.index === 2) {
        const status = hookData.cell.raw as string;
        if (status === "PASS") {
          hookData.cell.styles.textColor = [16, 185, 129];
          hookData.cell.styles.fontStyle = "bold";
        } else if (status === "WARNING") {
          hookData.cell.styles.textColor = [234, 179, 8];
          hookData.cell.styles.fontStyle = "bold";
        } else if (status === "FAIL") {
          hookData.cell.styles.textColor = [239, 68, 68];
          hookData.cell.styles.fontStyle = "bold";
        }
      }
      if (hookData.section === "body" && hookData.column.index === 1) {
        const severity = hookData.cell.raw as string;
        if (severity === "Critical" || severity === "High") {
          hookData.cell.styles.textColor = [239, 68, 68];
          hookData.cell.styles.fontStyle = "bold";
        } else if (severity === "Medium") {
          hookData.cell.styles.textColor = [234, 179, 8];
          hookData.cell.styles.fontStyle = "bold";
        } else {
          hookData.cell.styles.textColor = [16, 185, 129];
        }
      }
    },
  });

  // Get the Y position after the table
  let finalY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 12;

  // ---- Remediation Priority ----
  const failItems = data.items.filter((i) => i.status === "fail");
  const warnItems = data.items.filter((i) => i.status === "warning");

  if (failItems.length > 0 || warnItems.length > 0) {
    // Check if we need a new page
    if (finalY > 240) {
      doc.addPage();
      finalY = 25;
    }

    finalY = drawSectionHeader(doc, "Remediation Priority", finalY, margin);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text("The following items should be addressed in order of priority:", margin, finalY);
    finalY += 8;

    let priority = 1;
    const allPriority = [...failItems, ...warnItems];
    allPriority.forEach((item) => {
      if (finalY > 265) {
        doc.addPage();
        finalY = 25;
      }
      const icon = item.status === "fail" ? "●" : "○";
      const color = item.status === "fail" ? [239, 68, 68] : [234, 179, 8];
      doc.setTextColor(color[0], color[1], color[2]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.text(`${icon} Priority ${priority}:`, margin + 3, finalY);
      doc.setTextColor(30, 30, 30);
      doc.text(item.category, margin + 30, finalY);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      const recLines = doc.splitTextToSize(`→ ${item.recommendation}`, pageWidth - 2 * margin - 30);
      doc.text(recLines, margin + 30, finalY + 5);
      finalY += 5 + recLines.length * 4 + 4;
      priority++;
    });

    finalY += 5;
  }

  // ---- Notes Section ----
  if (data.notes) {
    if (finalY > 240) {
      doc.addPage();
      finalY = 25;
    }

    finalY = drawSectionHeader(doc, "Additional Notes", finalY, margin);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    const noteLines = doc.splitTextToSize(data.notes, pageWidth - 2 * margin);
    doc.text(noteLines, margin, finalY);
    finalY += noteLines.length * 5 + 10;
  }

  // ---- Disclaimer ----
  if (finalY > 250) {
    doc.addPage();
    finalY = 25;
  }

  finalY = drawSectionHeader(doc, "Disclaimer", finalY, margin);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  const disclaimer = "This report is generated by SecureCodeReviews.com automated security assessment tools and is intended for informational purposes only. The findings reflect the state of the application at the time of assessment and may not cover all potential vulnerabilities. This report should be used as a starting point for a comprehensive security review. SecureCodeReviews.com does not guarantee the completeness or accuracy of the automated assessment. For a thorough security audit, please contact our security team.";
  const disclaimerLines = doc.splitTextToSize(disclaimer, pageWidth - 2 * margin);
  doc.text(disclaimerLines, margin, finalY);

  // ---- Footer on every page ----
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.getHeight();

    // Footer green accent line
    doc.setFillColor(16, 185, 129);
    doc.rect(0, pageHeight - 22, pageWidth, 1, "F");

    // Footer background
    doc.setFillColor(248, 250, 252);
    doc.rect(0, pageHeight - 21, pageWidth, 21, "F");

    // Footer text
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(16, 185, 129);
    doc.text("SecureCodeReviews.com", margin, pageHeight - 13);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(
      " — Application Security Platform",
      margin + doc.getTextWidth("SecureCodeReviews.com"),
      pageHeight - 13
    );

    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - margin,
      pageHeight - 13,
      { align: "right" }
    );
    doc.setFontSize(6.5);
    doc.text(
      "CONFIDENTIAL — This report is generated for the sole use of the intended recipient. Unauthorized distribution is prohibited.",
      margin,
      pageHeight - 7
    );
    doc.text(
      reportId,
      pageWidth - margin,
      pageHeight - 7,
      { align: "right" }
    );
  }

  // Save the PDF
  doc.save(`SCR-Security-Report-${data.appName.replace(/\s+/g, "-")}-${new Date().toISOString().split("T")[0]}.pdf`);
}
