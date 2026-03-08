import { motion } from "framer-motion";

type RiskLevel = "low" | "moderate" | "high";

interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
}

const RiskBadge = ({ level, label }: RiskBadgeProps) => {
  const defaultLabels: Record<RiskLevel, string> = {
    low: "Low Risk",
    moderate: "Moderate Risk",
    high: "High Risk",
  };

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 200 }}
      className={`risk-badge-${level}`}
    >
      {label || defaultLabels[level]}
    </motion.span>
  );
};

export default RiskBadge;
