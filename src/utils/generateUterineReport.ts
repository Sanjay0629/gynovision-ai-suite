import jsPDF from "jspdf";

interface ShapFeature {
  feature: string;
  shap_value: number;
  direction: string;
}

export interface UterineReportData {
  prediction: number;
  probability: number;
  risk_tier: string;
  threshold_used: { low_upper: number; high_lower: number };
  shap_explanation: ShapFeature[];
  clinical_recommendations: string[];
  disclaimer: string;
  // Patient info
  patientName?: string;
  patientId?: string;
  patientAge?: string;
  referringPhysician?: string;
  // Clinical inputs for reference
  clinicalInputs?: Record<string, string | number | boolean>;
}

const COLORS = {
  primary: [22, 78, 159] as [number, number, number],
  heading: [17, 24, 39] as [number, number, number],
  body: [55, 65, 81] as [number, number, number],
  muted: [107, 114, 128] as [number, number, number],
  border: [209, 213, 219] as [number, number, number],
  bgLight: [243, 244, 246] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  riskLow: [21, 128, 61] as [number, number, number],
  riskMod: [161, 98, 7] as [number, number, number],
  riskHigh: [185, 28, 28] as [number, number, number],
  accent: [37, 99, 235] as [number, number, number],
};

export function generateUterineReport(data: UterineReportData) {
  const doc = new jsPDF();
  const margin = 18;
  let y = 0;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;
  let pageNum = 1;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 25) {
      addFooter();
      doc.addPage();
      pageNum++;
      doc.setFillColor(...COLORS.white);
      doc.rect(0, 0, pageWidth, pageHeight, "F");
      y = 20;
    }
  };

  const addFooter = () => {
    const footerY = pageHeight - 10;
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.2);
    doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...COLORS.muted);
    doc.text("AI-Assisted Uterine Cancer Clinical Risk Assessment", margin, footerY);
    doc.text(`Page ${pageNum}`, pageWidth - margin, footerY, { align: "right" });
    doc.setFillColor(...COLORS.primary);
    doc.rect(0, pageHeight - 3, pageWidth, 3, "F");
  };

  // ── White background ──
  doc.setFillColor(...COLORS.white);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ── Top accent bar ──
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 4, "F");

  // ── Header ──
  y = 18;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.primary);
  doc.text("UTERINE CANCER RISK REPORT", margin, y);
  y += 8;

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text("AI-Assisted Clinical Risk Assessment with SHAP Explanations", margin, y);
  y += 6;

  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Report Date: ${dateStr}  |  Time: ${timeStr}  |  Report ID: UTR-${Date.now().toString(36).toUpperCase()}`, margin, y);
  y += 8;

  // ── Patient Information ──
  if (data.patientName || data.patientId || data.patientAge || data.referringPhysician) {
    doc.setFillColor(...COLORS.bgLight);
    doc.roundedRect(margin, y, contentWidth, 32, 2, 2, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...COLORS.primary);
    doc.text("PATIENT INFORMATION", margin + 6, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(...COLORS.body);
    const col1 = margin + 6;
    const col2 = margin + contentWidth * 0.38;
    const col3 = margin + contentWidth * 0.7;
    const infoY = y + 14;

    doc.setFont("helvetica", "bold");
    doc.text("Name:", col1, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(data.patientName || "N/A", col1 + 20, infoY);

    doc.setFont("helvetica", "bold");
    doc.text("Patient ID:", col2, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(data.patientId || "N/A", col2 + 28, infoY);

    doc.setFont("helvetica", "bold");
    doc.text("Age:", col3, infoY);
    doc.setFont("helvetica", "normal");
    doc.text(data.patientAge ? `${data.patientAge} years` : "N/A", col3 + 14, infoY);

    const infoY2 = infoY + 10;
    doc.setFont("helvetica", "bold");
    doc.text("Referring Physician:", col1, infoY2);
    doc.setFont("helvetica", "normal");
    doc.text(data.referringPhysician || "N/A", col1 + 48, infoY2);

    y += 38;
  }

  // Header divider
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ── Helpers ──
  const sectionTitle = (title: string) => {
    ensureSpace(20);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...COLORS.primary);
    doc.text(title.toUpperCase(), margin, y);
    y += 2;
    doc.setDrawColor(...COLORS.accent);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + doc.getTextWidth(title.toUpperCase()), y);
    y += 7;
  };

  const thinDivider = () => {
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  // ── Risk Assessment ──
  sectionTitle("Risk Assessment");

  const riskColor = data.risk_tier === "High" ? COLORS.riskHigh
    : data.risk_tier === "Moderate" ? COLORS.riskMod : COLORS.riskLow;

  // Risk tier box
  const boxH = 36;
  doc.setFillColor(...COLORS.bgLight);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, boxH, 3, 3, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text("Risk Tier", margin + 6, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...riskColor);
  doc.text(data.risk_tier, margin + 6, y + 21);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Prediction: ${data.prediction === 1 ? "Positive" : "Negative"}`, margin + 6, y + 30);

  // Probability on right side
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text("Risk Probability", pageWidth - margin - 55, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(...COLORS.primary);
  doc.text(`${(data.probability * 100).toFixed(1)}%`, pageWidth - margin - 55, y + 21);

  // Threshold info
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(
    `Low ≤ ${(data.threshold_used.low_upper * 100).toFixed(0)}%  |  High ≥ ${(data.threshold_used.high_lower * 100).toFixed(0)}%`,
    pageWidth - margin - 55, y + 30
  );

  y += boxH + 10;

  // Probability bar
  const barW = contentWidth - 4;
  const barH = 6;
  doc.setFillColor(...COLORS.bgLight);
  doc.roundedRect(margin + 2, y, barW, barH, 2, 2, "F");
  const fillW = Math.max(1, data.probability * barW);
  doc.setFillColor(...riskColor);
  doc.roundedRect(margin + 2, y, fillW, barH, 2, 2, "F");
  y += barH + 4;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text("0%", margin + 2, y);
  doc.text("100%", pageWidth - margin - 2, y, { align: "right" });
  y += 8;

  thinDivider();

  // ── SHAP Explanation ──
  if (data.shap_explanation?.length > 0) {
    sectionTitle("Key Contributing Factors (SHAP)");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...COLORS.muted);
    doc.text("Top features influencing this prediction, ranked by impact magnitude", margin, y);
    y += 8;

    const maxAbs = Math.max(...data.shap_explanation.map((s) => Math.abs(s.shap_value)));
    const shapBarMax = contentWidth - 80;

    for (const feat of data.shap_explanation) {
      ensureSpace(16);
      const isRisk = feat.direction === "increases risk";
      const barColor = isRisk ? COLORS.riskHigh : COLORS.riskLow;
      const widthPct = Math.min((Math.abs(feat.shap_value) / maxAbs) * shapBarMax, shapBarMax);

      // Feature name
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.heading);
      doc.text(feat.feature.replace(/_/g, " "), margin + 2, y);

      // Direction + value
      doc.setFont("helvetica", "bold");
      doc.setFontSize(8);
      doc.setTextColor(...barColor);
      const arrow = isRisk ? "↑" : "↓";
      doc.text(`${arrow} ${Math.abs(feat.shap_value).toFixed(3)}`, pageWidth - margin - 2, y, { align: "right" });

      // Bar
      y += 3;
      doc.setFillColor(...COLORS.bgLight);
      doc.roundedRect(margin + 2, y, shapBarMax, 3, 1.5, 1.5, "F");
      doc.setFillColor(...barColor);
      doc.roundedRect(margin + 2, y, Math.max(0.5, widthPct), 3, 1.5, 1.5, "F");
      y += 9;
    }

    y += 4;
    thinDivider();
  }

  // ── Clinical Inputs Summary ──
  if (data.clinicalInputs) {
    sectionTitle("Clinical Parameters Summary");

    const entries = Object.entries(data.clinicalInputs);
    const colWidth = (contentWidth - 4) / 2;

    for (let i = 0; i < entries.length; i += 2) {
      ensureSpace(10);
      for (let j = 0; j < 2 && i + j < entries.length; j++) {
        const [key, val] = entries[i + j];
        const xOff = margin + 2 + j * colWidth;
        const label = key.replace(/_/g, " ");

        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        doc.setTextColor(...COLORS.muted);
        doc.text(`${label}:`, xOff, y);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(...COLORS.body);
        doc.text(String(val), xOff + doc.getTextWidth(`${label}: `) + 2, y);
      }
      y += 6;
    }

    y += 4;
    thinDivider();
  }

  // ── Clinical Recommendations ──
  if (data.clinical_recommendations?.length > 0) {
    sectionTitle("Clinical Recommendations");

    for (const rec of data.clinical_recommendations) {
      ensureSpace(14);

      doc.setFillColor(...COLORS.primary);
      doc.circle(margin + 5, y - 1.2, 1.2, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.body);
      const lines = doc.splitTextToSize(rec, contentWidth - 14);
      doc.text(lines, margin + 10, y);
      y += lines.length * 4.5 + 3;
    }

    y += 4;
    thinDivider();
  }

  // ── Disclaimer ──
  const disclaimerText = data.disclaimer ||
    "This report is generated by an AI-assisted clinical risk assessment model for educational and clinical decision-support purposes only. It does NOT constitute a definitive medical diagnosis. All findings must be reviewed and confirmed by a qualified healthcare professional.";

  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 16);
  const disclaimerH = disclaimerLines.length * 4 + 12;

  ensureSpace(disclaimerH + 10);

  doc.setFillColor(254, 249, 235);
  doc.setDrawColor(217, 175, 62);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, disclaimerH, 2, 2, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.setTextColor(161, 98, 7);
  doc.text("DISCLAIMER", margin + 6, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.5);
  doc.setTextColor(120, 90, 30);
  doc.text(disclaimerLines, margin + 6, y + 13);

  y += disclaimerH + 8;

  // ── Footer ──
  addFooter();

  doc.save(`uterine-clinical-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
