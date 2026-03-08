import { motion } from "framer-motion";

const DNAHelix = () => {
  const strandCount = 14;

  return (
    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-40 md:w-56 h-[420px] opacity-20 pointer-events-none overflow-hidden">
      <svg viewBox="0 0 120 400" className="w-full h-full" fill="none">
        {Array.from({ length: strandCount }).map((_, i) => {
          const y = (i / (strandCount - 1)) * 380 + 10;
          const phase = (i / strandCount) * Math.PI * 2;
          const x1 = 60 + Math.sin(phase) * 35;
          const x2 = 60 - Math.sin(phase) * 35;

          return (
            <motion.g
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              {/* Cross bar */}
              <line
                x1={x1}
                y1={y}
                x2={x2}
                y2={y}
                stroke="hsl(var(--primary))"
                strokeWidth="1"
                strokeOpacity="0.4"
              />
              {/* Left node */}
              <circle cx={x1} cy={y} r="3.5" fill="hsl(var(--primary))" fillOpacity="0.6" />
              {/* Right node */}
              <circle cx={x2} cy={y} r="3.5" fill="hsl(var(--medical-teal))" fillOpacity="0.6" />
            </motion.g>
          );
        })}
        {/* Strand curves */}
        <motion.path
          d={`M ${60 + Math.sin(0) * 35} 10 ${Array.from({ length: strandCount })
            .map((_, i) => {
              const y = (i / (strandCount - 1)) * 380 + 10;
              return `L ${60 + Math.sin((i / strandCount) * Math.PI * 2) * 35} ${y}`;
            })
            .join(" ")}`}
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        <motion.path
          d={`M ${60 - Math.sin(0) * 35} 10 ${Array.from({ length: strandCount })
            .map((_, i) => {
              const y = (i / (strandCount - 1)) * 380 + 10;
              return `L ${60 - Math.sin((i / strandCount) * Math.PI * 2) * 35} ${y}`;
            })
            .join(" ")}`}
          stroke="hsl(var(--medical-teal))"
          strokeWidth="1.5"
          strokeOpacity="0.3"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeInOut", delay: 0.3 }}
        />
      </svg>
    </div>
  );
};

export default DNAHelix;
