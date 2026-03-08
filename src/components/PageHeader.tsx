import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: ReactNode;
}

const PageHeader = ({ title, subtitle, icon }: PageHeaderProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="text-center mb-12"
  >
    {icon && (
      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
    )}
    <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
      {title}
    </h1>
    <div className="w-20 h-1 rounded-full mx-auto mb-4" style={{ background: "var(--gradient-primary)" }} />
    <p className="text-muted-foreground max-w-2xl mx-auto text-balance">
      {subtitle}
    </p>
  </motion.div>
);

export default PageHeader;
