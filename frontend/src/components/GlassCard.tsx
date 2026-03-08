import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  delay?: number;
}

const GlassCard = ({ children, className = "", hover = true, delay = 0 }: GlassCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className={`${hover ? "glass-card-hover" : "glass-card"} p-6 ${className}`}
  >
    {children}
  </motion.div>
);

export default GlassCard;
