import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Brain,
  Dna,
  Microscope,
  Activity,
  ArrowRight,
  Sparkles,
  Shield,
  FileSearch,
  Layers,
  ChevronRight,
} from "lucide-react";
import GlassCard from "@/components/GlassCard";
import ParticleField from "@/components/ParticleField";
import DNAHelix from "@/components/DNAHelix";

const features = [
  {
    icon: <Activity className="w-6 h-6" />,
    title: "Clinical Intelligence",
    description:
      "Advanced risk prediction models trained on comprehensive clinical datasets for evidence-based decision support.",
    color: "from-primary/20 to-primary/5",
    iconBg: "bg-primary/15 text-primary",
    link: "/uterine-clinical",
  },
  {
    icon: <Dna className="w-6 h-6" />,
    title: "Molecular Prognostics",
    description:
      "TCGA-based molecular subtype classification for precise prognosis and personalized treatment guidance.",
    color: "from-medical-teal/20 to-medical-teal/5",
    iconBg: "bg-medical-teal/15 text-medical-teal",
    link: "/uterine-molecular",
  },
  {
    icon: <Microscope className="w-6 h-6" />,
    title: "Deep Learning Imaging",
    description:
      "CNN-powered Pap smear cytology classification for automated cervical cancer screening assistance.",
    color: "from-medical-indigo/20 to-medical-indigo/5",
    iconBg: "bg-medical-indigo/15 text-medical-indigo",
    link: "/cervical-cytology",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Cervical Clinical Risk",
    description:
      "Evidence-based cervical cancer risk assessment using patient demographics, HPV status, and clinical history.",
    color: "from-rose-500/20 to-rose-500/5",
    iconBg: "bg-rose-500/15 text-rose-500",
    link: "/cervical-clinical",
  },
];

const workflow = [
  {
    step: "01",
    icon: <FileSearch className="w-5 h-5" />,
    title: "Input Clinical Data",
    desc: "Enter patient demographics, medical history, or upload cytology images.",
  },
  {
    step: "02",
    icon: <Brain className="w-5 h-5" />,
    title: "AI Analysis",
    desc: "Our multimodal models process data through clinical, molecular, and imaging pipelines.",
  },
  {
    step: "03",
    icon: <Layers className="w-5 h-5" />,
    title: "Risk Stratification",
    desc: "Receive color-coded risk assessments with confidence scores and interpretations.",
  },
  {
    step: "04",
    icon: <Shield className="w-5 h-5" />,
    title: "Clinical Decision Support",
    desc: "Evidence-backed recommendations to support — not replace — medical judgment.",
  },
];

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ─── Hero ─── */}
      <section
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center overflow-hidden bg-hero-gradient"
      >
        <ParticleField />
        <div className="absolute inset-0 bg-grid opacity-30" />

        {/* Glow orbs */}
        <div className="absolute top-20 left-[10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px] animate-pulse-glow" />
        <div
          className="absolute bottom-20 right-[10%] w-[400px] h-[400px] rounded-full bg-medical-teal/8 blur-[100px] animate-pulse-glow"
          style={{ animationDelay: "1.5s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-medical-indigo/5 blur-[140px] animate-pulse-glow"
          style={{ animationDelay: "3s" }}
        />

        <DNAHelix />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="container mx-auto px-4 relative z-10"
        >
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-8 backdrop-blur-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Multimodal AI Platform for Gynecological Oncology
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 leading-[1.05] tracking-tight"
            >
              <span className="text-foreground">Gyno</span>
              <span style={{ color: "hsl(230 65% 55%)" }}>Vision</span>
              <span className="text-foreground"> AI</span>
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="text-lg md:text-xl text-muted-foreground mb-3 max-w-2xl mx-auto text-balance font-medium"
            >
              AI-Powered Multimodal Gynecological Cancer Decision Support
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.4 }}
              className="text-sm text-muted-foreground/70 mb-12 max-w-xl mx-auto leading-relaxed"
            >
              Integrating clinical risk prediction, TCGA molecular prognostics, and deep learning
              image analysis into one unified clinical decision support platform.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.55 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <Link
                to="/uterine-clinical"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm text-primary-foreground transition-all duration-300 hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Explore Uterine Cancer
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/cervical-clinical"
                className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-semibold text-sm border border-border/80 bg-card/60 backdrop-blur-sm text-foreground hover:bg-card/90 transition-all duration-300 hover:shadow-lg hover:border-primary/30"
              >
                Explore Cervical Cancer
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              className="mt-16 flex flex-col items-center gap-2"
            >
              <span className="text-xs text-muted-foreground/50 uppercase tracking-widest">
                Scroll to explore
              </span>
              <motion.div
                animate={{ y: [0, 6, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
                className="w-5 h-8 rounded-full border-2 border-muted-foreground/20 flex items-start justify-center pt-1.5"
              >
                <div className="w-1 h-1.5 rounded-full bg-muted-foreground/40" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ─── Feature Cards ─── */}
      <section id="predict" className="py-28 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-3 block">
              Core Modules
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              Multimodal AI Capabilities
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three integrated AI modules working together for comprehensive gynecological cancer
              assessment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Link to={feature.link} className="block h-full">
                  <div className="glass-card-hover p-7 h-full gradient-border group cursor-pointer">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${feature.iconBg} transition-transform duration-300 group-hover:scale-110`}
                    >
                      {feature.icon}
                    </div>
                    <h3 className="font-display font-semibold text-lg text-foreground mb-2.5">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {feature.description}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary transition-all group-hover:gap-2.5">
                      Explore module <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section className="py-28 relative bg-muted/20">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-medical-teal mb-3 block">
              Workflow
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              From data input to clinical insight in four streamlined steps.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {workflow.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative"
              >
                <div className="glass-card p-6 h-full">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="font-display text-2xl font-bold gradient-text">{item.step}</span>
                    <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      {item.icon}
                    </div>
                  </div>
                  <h4 className="font-display font-semibold text-foreground mb-2">{item.title}</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                {/* Connector line on desktop */}
                {i < workflow.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-px bg-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-20 border-y border-border/50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10 max-w-4xl mx-auto text-center">
            {[
              { value: "4", label: "AI Modules", suffix: "" },
              { value: "TCGA", label: "Molecular Data", suffix: "" },
              { value: "CNN", label: "Image Analysis", suffix: "" },
              { value: "97", label: "Research Accuracy", suffix: "%+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, type: "spring", stiffness: 150 }}
              >
                <div className="font-display text-3xl md:text-4xl font-bold gradient-text mb-1.5">
                  {stat.value}
                  <span className="text-lg">{stat.suffix}</span>
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-widest">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-28">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto rounded-3xl p-10 md:p-16 text-center relative overflow-hidden"
            style={{ background: "var(--gradient-primary)" }}
          >
            {/* Decorative circles */}
            <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/5 blur-xl" />
            <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-white/5 blur-xl" />

            <div className="relative z-10">
              <h2 className="font-display text-2xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Explore AI-Powered Cancer Assessment?
              </h2>
              <p className="text-primary-foreground/70 mb-8 max-w-lg mx-auto text-sm md:text-base">
                Start with our clinical prediction modules or explore TCGA-based molecular
                analysis for comprehensive gynecological cancer decision support.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  to="/uterine-clinical"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm bg-card text-foreground hover:bg-card/90 transition-all duration-300 hover:shadow-lg"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link
                  to="/about"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-primary-foreground/90 border border-primary-foreground/20 hover:bg-primary-foreground/10 transition-all duration-300"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Index;
