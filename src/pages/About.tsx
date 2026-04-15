import { motion } from "framer-motion";
import { Brain, Database, Cpu, Shield, BookOpen, Layers, Sparkles, CheckCircle2, Stethoscope } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";

const About = () => {
  const technologies = [
    { icon: <Cpu className="w-5 h-5 text-primary" />, name: "Deep Learning", desc: "CNN architectures for cytology image classification" },
    { icon: <Database className="w-5 h-5 text-medical-teal" />, name: "TCGA Database", desc: "The Cancer Genome Atlas molecular profiling data" },
    { icon: <Layers className="w-5 h-5 text-medical-indigo" />, name: "Ensemble Models", desc: "Multi-model clinical risk prediction pipelines" },
    { icon: <Shield className="w-5 h-5 text-risk-moderate" />, name: "Ethics-First", desc: "Built for decision support, not autonomous diagnosis" },
    { icon: <Sparkles className="w-5 h-5 text-yellow-400" />, name: "Gemini LLM", desc: "AI-generated clinical decision support and actionable guidance" },
  ];

  const datasets = [
    { name: "TCGA-UCEC", description: "Uterine Corpus Endometrial Carcinoma – molecular subtypes and clinical outcomes" },
    { name: "SipakMed", description: "Pap smear cytology image dataset for cervical cell classification" },
    { name: "Clinical Registry Data", description: "Curated clinical features from gynecological oncology databases" },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PageHeader
          icon={<BookOpen className="w-7 h-7 text-primary" />}
          title="About GynoVision AI"
          subtitle="A multimodal AI platform designed to support gynecological cancer assessment through clinical, molecular, and imaging data."
        />

        <div className="max-w-4xl mx-auto space-y-12">
          {/* Mission */}
          <GlassCard hover={false}>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              GynoVision AI aims to bridge the gap between advanced computational research and clinical practice in gynecological oncology. By integrating multiple AI modalities — clinical risk models, molecular subtype classifiers, and deep learning image analysis — we provide a unified decision support platform that enhances clinician capabilities while maintaining the highest standards of medical ethics and interpretability.
            </p>
          </GlassCard>

          {/* Multimodal Approach */}
          <div>
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="font-display text-xl font-semibold text-foreground mb-6 text-center"
            >
              Multimodal AI Approach
            </motion.h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {technologies.map((tech, i) => (
                <GlassCard key={tech.name} delay={i * 0.1} className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    {tech.icon}
                  </div>
                  <div>
                    <h3 className="font-display font-semibold text-foreground text-sm">{tech.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{tech.desc}</p>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>

          {/* LLM Clinical Decision Support */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <GlassCard hover={false} className="border-yellow-400/20">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold text-foreground">LLM-Powered Clinical Decision Support</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">Powered by Google Gemini</p>
                </div>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                Every prediction in GynoVision AI is augmented by a <span className="text-foreground font-medium">large language model (LLM)</span> layer
                powered by <span className="text-yellow-400 font-medium">Google Gemini</span>. Once a ML model produces a risk score or classification,
                the structured result — including risk label, probability, and SHAP feature attributions — is passed to Gemini, which synthesises
                a contextual clinical narrative and a prioritised list of recommended actions. This bridges the gap between raw model output and
                actionable clinical insight.
              </p>

              <div className="grid sm:grid-cols-3 gap-4 mb-6">
                {[
                  {
                    icon: <Brain className="w-4 h-4 text-primary" />,
                    title: "Cervical Clinical Risk",
                    desc: "After the XGBoost ensemble scores a patient, Gemini interprets the risk tier and SHAP factors to generate a personalised clinical summary and follow-up protocol.",
                  },
                  {
                    icon: <Stethoscope className="w-4 h-4 text-medical-teal" />,
                    title: "Cervical Cytology (Pap smear)",
                    desc: "Following ResNet-50 cell classification, Gemini translates the predicted Bethesda category into clinician-ready guidance on colposcopy, repeat screening, or reassurance.",
                  },
                  {
                    icon: <Database className="w-4 h-4 text-medical-indigo" />,
                    title: "Uterine Molecular Subtype",
                    desc: "After TCGA-trained molecular subtyping, Gemini maps the predicted TCGA subtype to ESMO/NCCN-aligned management pathways and survival context.",
                  },
                ].map((item, i) => (
                  <motion.div
                    key={item.title}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-xl bg-muted/40 p-4 space-y-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-background/60 flex items-center justify-center">
                      {item.icon}
                    </div>
                    <h4 className="text-sm font-semibold text-foreground">{item.title}</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              <div className="border-t border-border/40 pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">What the LLM produces</h4>
                <div className="space-y-2">
                  {[
                    "A plain-language clinical interpretation summarising the key risk drivers identified by SHAP",
                    "A prioritised list of evidence-informed recommended actions (screening, referral, monitoring, or reassurance)",
                    "Context-aware guidance that adapts to the predicted risk tier — Low, Moderate, or High",
                    "Content embedded directly into downloadable PDF patient reports for clinician handover",
                  ].map((point, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Datasets */}
          <GlassCard hover={false}>
            <h2 className="font-display text-xl font-semibold text-foreground mb-4">Datasets Used</h2>
            <div className="space-y-4">
              {datasets.map((ds) => (
                <div key={ds.name} className="border-l-2 border-primary/30 pl-4">
                  <h4 className="font-display font-semibold text-sm text-foreground">{ds.name}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{ds.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Disclaimer */}
          <GlassCard hover={false} className="border-primary/20">
            <h2 className="font-display text-xl font-semibold text-foreground mb-3">Academic & Ethical Disclaimer</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              GynoVision AI is developed for academic research and educational demonstration purposes. It is not intended for clinical deployment without proper regulatory approval and clinical validation. All predictions are generated by machine learning models and must be interpreted by qualified medical professionals. This system emphasizes decision support, not autonomous diagnosis.
            </p>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default About;
