import { motion } from "framer-motion";

const subtypeColors: Record<string, string> = {
  POLE: "bg-medical-teal/15 text-medical-teal border-medical-teal/30",
  MSI: "bg-medical-indigo/15 text-medical-indigo border-medical-indigo/30",
  CN_LOW: "bg-risk-moderate/15 text-risk-moderate border-risk-moderate/30",
  CN_HIGH: "bg-risk-high/15 text-risk-high border-risk-high/30",
};

interface MolecularBadgeProps {
  subtype: string;
}

const MolecularBadge = ({ subtype }: MolecularBadgeProps) => (
  <motion.span
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 200 }}
    className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold border ${
      subtypeColors[subtype] || "bg-muted text-muted-foreground border-border"
    }`}
  >
    {subtype}
  </motion.span>
);

export default MolecularBadge;
