import { motion } from "framer-motion";

interface ConfidenceBarProps {
  value: number; // 0-100
  label?: string;
}

const ConfidenceBar = ({ value, label = "Confidence" }: ConfidenceBarProps) => (
  <div className="w-full">
    <div className="flex justify-between items-center mb-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <span className="text-sm font-semibold text-primary">{value}%</span>
    </div>
    <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
        className="h-full rounded-full"
        style={{ background: "var(--gradient-primary)" }}
      />
    </div>
  </div>
);

export default ConfidenceBar;
