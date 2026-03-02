import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Brain, Dna, Microscope, Activity, ArrowRight } from "lucide-react";
import GlassCard from "@/components/GlassCard";

const features = [
  {
    icon: <Activity className="w-6 h-6 text-primary" />,
    title: "Clinical Intelligence",
    description: "Advanced risk prediction models trained on comprehensive clinical datasets for evidence-based decision support.",
    emoji: "🧬",
  },
  {
    icon: <Dna className="w-6 h-6 text-medical-teal" />,
    title: "Molecular Prognostics",
    description: "TCGA-based molecular subtype classification for precise prognosis and personalized treatment guidance.",
    emoji: "🧪",
  },
  {
    icon: <Microscope className="w-6 h-6 text-medical-indigo" />,
    title: "Deep Learning Image Analysis",
    description: "CNN-powered Pap smear cytology classification for automated cervical cancer screening assistance.",
    emoji: "🔬",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-hero-gradient">
        {/* Grid background */}
        <div className="absolute inset-0 bg-grid opacity-50" />
        
        {/* Floating glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-medical-teal/5 blur-3xl animate-pulse-glow" style={{ animationDelay: "1.5s" }} />

        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary font-medium mb-8">
              <Brain className="w-4 h-4" />
              Multimodal AI Platform
            </div>

            <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-foreground">Gyno</span>
              <span className="gradient-text">Vision</span>
              <span className="text-foreground"> AI</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground mb-4 max-w-2xl mx-auto text-balance">
              AI-Powered Multimodal Gynecological Cancer Decision Support
            </p>
            <p className="text-sm text-muted-foreground mb-10 max-w-xl mx-auto">
              Integrating clinical risk prediction, molecular prognostics, and deep learning image analysis into a unified decision support platform.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/uterine-clinical"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm text-primary-foreground transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                style={{ background: "var(--gradient-primary)" }}
              >
                Explore Uterine Cancer
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/cervical-clinical"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm border border-border bg-card/80 text-foreground hover:bg-card transition-all duration-300 hover:shadow-md"
              >
                Explore Cervical Cancer
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Feature Cards */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Multimodal AI Capabilities
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Three integrated AI modules working together for comprehensive gynecological cancer assessment.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {features.map((feature, i) => (
              <GlassCard key={feature.title} delay={i * 0.15} className="gradient-border">
                <div className="text-3xl mb-4">{feature.emoji}</div>
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 border-y border-border/50 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: "4", label: "AI Modules" },
              { value: "TCGA", label: "Molecular Data" },
              { value: "CNN", label: "Image Analysis" },
              { value: "97%+", label: "Research Accuracy" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="font-display text-2xl md:text-3xl font-bold gradient-text mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
