import jsPDF from "jspdf";

interface ReportData {
  prediction: string;
  confidence: number;
  classProbabilities: Record<string, number>;
}

const RECOMMENDATIONS: Record<string, { interpretation: string; riskLevel: string; actions: string[] }> = {
  "Superficial-Intermediate": {
    interpretation: "Normal mature squamous epithelial cells with no evidence of abnormality.",
    riskLevel: "Low",
    actions: [
      "Continue routine cervical screening as per guidelines",
      "No immediate medical intervention required",
    ],
  },
  Parabasal: {
    interpretation: "Immature cells, commonly associated with hormonal changes, atrophy, or mild inflammation.",
    riskLevel: "Low",
    actions: [
      "Routine screening recommended",
      "If present in high numbers: evaluate for hormonal imbalance or inflammation",
      "Clinical correlation may be required",
    ],
  },
  Metaplastic: {
    interpretation: "Cells undergoing normal transformation in the cervical epithelium (transformation zone).",
    riskLevel: "Low",
    actions: [
      "No treatment required",
      "Continue routine Pap smear screening",
      "Monitor only if atypical changes are suspected",
    ],
  },
  Koilocytotic: {
    interpretation: "Indicative of HPV infection, often associated with low-grade squamous intraepithelial lesions (LSIL).",
    riskLevel: "Moderate",
    actions: [
      "Perform HPV DNA testing",
      "Repeat Pap smear in 6-12 months",
      "Consider colposcopy if high-risk HPV is detected",
      "Consider colposcopy if abnormality persists",
    ],
  },
  Dyskeratotic: {
    interpretation: "Abnormal keratinized cells associated with precancerous changes and possible high-grade lesions (HSIL).",
    riskLevel: "High",
    actions: [
      "Immediate colposcopic evaluation",
      "Biopsy for confirmation",
      "Close clinical follow-up and management",
      "Treatment based on histopathological findings",
    ],
  },
};

// Color palette
const COLORS = {
  primary: [22, 78, 159] as [number, number, number],      // Deep medical blue
  heading: [17, 24, 39] as [number, number, number],        // Near black
  body: [55, 65, 81] as [number, number, number],           // Dark gray
  muted: [107, 114, 128] as [number, number, number],       // Gray
  border: [209, 213, 219] as [number, number, number],      // Light gray
  bgLight: [243, 244, 246] as [number, number, number],     // Very light gray
  white: [255, 255, 255] as [number, number, number],
  riskLow: [21, 128, 61] as [number, number, number],       // Green
  riskMod: [161, 98, 7] as [number, number, number],        // Amber
  riskHigh: [185, 28, 28] as [number, number, number],      // Red
  accent: [37, 99, 235] as [number, number, number],        // Blue accent
};

export function generateCervicalReport(data: ReportData) {
  const doc = new jsPDF();
  const margin = 18;
  let y = 0;
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const contentWidth = pageWidth - margin * 2;

  // ── White background ──
  doc.setFillColor(...COLORS.white);
  doc.rect(0, 0, pageWidth, pageHeight, "F");

  // ── Top accent bar ──
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, pageWidth, 4, "F");

  // ── Header section ──
  y = 18;

  // Title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(...COLORS.primary);
  doc.text("CERVICAL CYTOLOGY REPORT", margin, y);
  y += 8;

  // Subtitle line
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...COLORS.muted);
  doc.text("AI-Assisted Pap Smear Cell Classification Report", margin, y);
  y += 6;

  // Report metadata row
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const timeStr = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  doc.setFontSize(8);
  doc.setTextColor(...COLORS.muted);
  doc.text(`Report Date: ${dateStr}  |  Time: ${timeStr}  |  Report ID: CYT-${Date.now().toString(36).toUpperCase()}`, margin, y);
  y += 6;

  // Header divider
  doc.setDrawColor(...COLORS.primary);
  doc.setLineWidth(0.8);
  doc.line(margin, y, pageWidth - margin, y);
  y += 10;

  // ── Helper functions ──
  const sectionTitle = (title: string) => {
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

  const labelValue = (label: string, value: string, valueColor?: [number, number, number]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.muted);
    doc.text(label, margin + 2, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...(valueColor || COLORS.heading));
    doc.text(value, margin + 52, y);
    y += 6;
  };

  const thinDivider = () => {
    doc.setDrawColor(...COLORS.border);
    doc.setLineWidth(0.3);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;
  };

  // ── Classification Result ──
  sectionTitle("Classification Result");

  // Result box
  const boxH = 28;
  doc.setFillColor(...COLORS.bgLight);
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, boxH, 3, 3, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text("Predicted Cell Type", margin + 6, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.heading);
  doc.text(data.prediction, margin + 6, y + 19);

  // Confidence on right side
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.muted);
  doc.text("Model Confidence", pageWidth - margin - 50, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.primary);
  doc.text(`${(data.confidence * 100).toFixed(1)}%`, pageWidth - margin - 50, y + 19);

  y += boxH + 10;

  // ── Class Probabilities ──
  sectionTitle("Class Probabilities");

  const sorted = Object.entries(data.classProbabilities).sort(([, a], [, b]) => b - a);
  const barMaxWidth = contentWidth - 70;

  for (const [cls, prob] of sorted) {
    const isPredicted = cls === data.prediction;
    const pct = (prob * 100).toFixed(1);

    // Label
    doc.setFont("helvetica", isPredicted ? "bold" : "normal");
    doc.setFontSize(9);
    doc.setTextColor(...(isPredicted ? COLORS.heading : COLORS.body));
    doc.text(cls, margin + 2, y);

    // Percentage
    doc.setFont("helvetica", isPredicted ? "bold" : "normal");
    doc.text(`${pct}%`, pageWidth - margin - 14, y, { align: "right" });

    // Bar background
    const barY = y + 2;
    const barH = 3.5;
    doc.setFillColor(...COLORS.bgLight);
    doc.roundedRect(margin + 2, barY, barMaxWidth, barH, 1.5, 1.5, "F");

    // Bar fill
    const fillWidth = Math.max(0.5, (prob * barMaxWidth));
    if (isPredicted) {
      doc.setFillColor(...COLORS.primary);
    } else {
      doc.setFillColor(...COLORS.border);
    }
    doc.roundedRect(margin + 2, barY, fillWidth, barH, 1.5, 1.5, "F");

    y += 11;
  }

  y += 4;
  thinDivider();

  // ── Clinical Recommendation ──
  const rec = RECOMMENDATIONS[data.prediction];
  if (rec) {
    sectionTitle("Clinical Recommendation");

    // Risk level badge
    const riskColor = rec.riskLevel === "High" ? COLORS.riskHigh
      : rec.riskLevel === "Moderate" ? COLORS.riskMod : COLORS.riskLow;

    labelValue("Risk Level:", rec.riskLevel, riskColor);
    y += 2;

    // Interpretation
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.heading);
    doc.text("Clinical Interpretation", margin + 2, y);
    y += 5;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...COLORS.body);
    const interpLines = doc.splitTextToSize(rec.interpretation, contentWidth - 4);
    doc.text(interpLines, margin + 2, y);
    y += interpLines.length * 4.5 + 5;

    // Actions
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLORS.heading);
    doc.text("Recommended Actions", margin + 2, y);
    y += 6;

    for (const action of rec.actions) {
      doc.setFillColor(...COLORS.primary);
      doc.circle(margin + 5, y - 1.2, 1.2, "F");

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...COLORS.body);
      const actionLines = doc.splitTextToSize(action, contentWidth - 14);
      doc.text(actionLines, margin + 10, y);
      y += actionLines.length * 4.5 + 3;
    }

    y += 4;
    thinDivider();
  }

  // ── Disclaimer ──
  // Box
  const disclaimerText = "This report is generated by an AI-assisted classification model for educational and clinical decision-support purposes only. It does NOT constitute a definitive medical diagnosis. All findings must be reviewed and confirmed by a qualified healthcare professional. Treatment decisions should not be based solely on this report.";

  const disclaimerLines = doc.splitTextToSize(disclaimerText, contentWidth - 16);
  const disclaimerH = disclaimerLines.length * 4 + 12;

  // Ensure it fits on page
  if (y + disclaimerH + 20 > pageHeight) {
    doc.addPage();
    doc.setFillColor(...COLORS.white);
    doc.rect(0, 0, pageWidth, pageHeight, "F");
    y = 20;
  }

  doc.setFillColor(254, 249, 235); // Warm yellow tint
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
  const footerY = pageHeight - 10;
  doc.setDrawColor(...COLORS.border);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  doc.setTextColor(...COLORS.muted);
  doc.text("AI-Assisted Cervical Cytology Classification System", margin, footerY);
  doc.text("Page 1 of 1", pageWidth - margin, footerY, { align: "right" });

  // Bottom accent bar
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, pageHeight - 3, pageWidth, 3, "F");

  doc.save(`cervical-cytology-report-${new Date().toISOString().slice(0, 10)}.pdf`);
}
