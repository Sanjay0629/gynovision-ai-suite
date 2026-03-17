import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import GlassCard from "./GlassCard";

interface ClinicalRec {
  interpretation: string;
  riskLevel: "low" | "moderate" | "high";
  actions: string[];
}

const RECOMMENDATIONS: Record<string, ClinicalRec> = {
  "Superficial-Intermediate": {
    interpretation: "Normal mature squamous epithelial cells with no evidence of abnormality.",
    riskLevel: "low",
    actions: [
      "Continue routine cervical screening as per guidelines",
      "No immediate medical intervention required",
    ],
  },
  Parabasal: {
    interpretation: "Immature cells, commonly associated with hormonal changes, atrophy, or mild inflammation.",
    riskLevel: "low",
    actions: [
      "Routine screening recommended",
      "If present in high numbers: evaluate for hormonal imbalance or inflammation",
      "Clinical correlation may be required",
    ],
  },
  Metaplastic: {
    interpretation: "Cells undergoing normal transformation in the cervical epithelium (transformation zone).",
    riskLevel: "low",
    actions: [
      "No treatment required",
      "Continue routine Pap smear screening",
      "Monitor only if atypical changes are suspected",
    ],
  },
  Koilocytotic: {
    interpretation: "Indicative of HPV infection, often associated with low-grade squamous intraepithelial lesions (LSIL).",
    riskLevel: "moderate",
    actions: [
      "Perform HPV DNA testing",
      "Repeat Pap smear in 6–12 months",
      "Consider colposcopy if high-risk HPV is detected",
      "Consider colposcopy if abnormality persists",
    ],
  },
  Dyskeratotic: {
    interpretation: "Abnormal keratinized cells associated with precancerous changes and possible high-grade lesions (HSIL).",
    riskLevel: "high",
    actions: [
      "Immediate colposcopic evaluation",
      "Biopsy for confirmation",
      "Close clinical follow-up and management",
      "Treatment based on histopathological findings",
    ],
  },
};

const RISK_CONFIG = {
  low: {
    label: "Low Risk",
    icon: ShieldCheck,
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    text: "text-green-500",
    badge: "bg-green-500/15 text-green-500 border-green-500/30",
  },
  moderate: {
    label: "Moderate Risk",
    icon: ShieldAlert,
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    text: "text-yellow-500",
    badge: "bg-yellow-500/15 text-yellow-500 border-yellow-500/30",
  },
  high: {
    label: "High Risk",
    icon: AlertTriangle,
    border: "border-destructive/30",
    bg: "bg-destructive/10",
    text: "text-destructive",
    badge: "bg-destructive/15 text-destructive border-destructive/30",
  },
};

interface Props {
  prediction: string;
}

const ClinicalRecommendation = ({ prediction }: Props) => {
  const rec = RECOMMENDATIONS[prediction];
  if (!rec) return null;

  const risk = RISK_CONFIG[rec.riskLevel];
  const RiskIcon = risk.icon;

  return (
    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <GlassCard hover={false}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-display font-semibold text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              Clinical Recommendation
            </h4>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${risk.badge} flex items-center gap-1.5`}>
              <RiskIcon className="w-3.5 h-3.5" />
              {risk.label}
            </span>
          </div>

          <div className={`rounded-lg border p-3 ${risk.border} ${risk.bg}`}>
            <p className="text-sm font-medium text-foreground mb-1">Clinical Interpretation</p>
            <p className="text-sm text-muted-foreground">{rec.interpretation}</p>
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Recommended Actions</p>
            <ul className="space-y-1.5">
              {rec.actions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <ArrowRight className="w-3.5 h-3.5 mt-0.5 shrink-0 text-primary" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default ClinicalRecommendation;
