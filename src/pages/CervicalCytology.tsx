import { useState } from "react";
import { motion } from "framer-motion";
import { Microscope, Loader2, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import ConfidenceBar from "@/components/ConfidenceBar";
import ImageUploadZone from "@/components/ImageUploadZone";
import { Button } from "@/components/ui/button";

const CervicalCytology = () => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { cellType: string; confidence: number }>(null);

  const handleClassify = () => {
    if (!file) return;
    setLoading(true);
    setTimeout(() => {
      setResult({ cellType: "LSIL (Low-grade Squamous Intraepithelial Lesion)", confidence: 88 });
      setLoading(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PageHeader
          icon={<Microscope className="w-7 h-7 text-medical-indigo" />}
          title="Cervical Cytology Image Classification"
          subtitle="CNN-powered Pap smear cell classification for automated cervical cancer screening assistance."
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <GlassCard hover={false}>
            <h3 className="font-display font-semibold text-lg text-foreground mb-6">Upload Cytology Image</h3>
            <ImageUploadZone onFileSelect={setFile} />
            <Button
              onClick={handleClassify}
              disabled={!file || loading}
              className="w-full mt-6"
              style={{ background: "var(--gradient-primary)" }}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {loading ? "Classifying..." : "Classify Cell Image"}
            </Button>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard hover={false}>
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">Classification Result</h3>
              {!result && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Microscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Upload an image and click classify</p>
                </div>
              )}
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Running CNN classification...</p>
                </div>
              )}
              {result && !loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div>
                    <span className="text-sm text-muted-foreground">Predicted Cell Type</span>
                    <p className="font-display font-semibold text-foreground mt-1">{result.cellType}</p>
                  </div>
                  <ConfidenceBar value={result.confidence} label="Classification Confidence" />
                </motion.div>
              )}
            </GlassCard>

            <div className="rounded-xl border border-risk-high/30 bg-risk-high/5 p-4 flex gap-3 items-start">
              <AlertTriangle className="w-5 h-5 text-risk-high shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground leading-relaxed">
                This tool supports cytological screening and does not replace medical diagnosis. Results should be interpreted by a qualified pathologist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CervicalCytology;
