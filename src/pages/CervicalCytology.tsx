import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Microscope, Loader2, Eye, TrendingUp, Upload, Download } from "lucide-react";
import { generateCervicalReport } from "@/utils/generateCervicalReport";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import DisclaimerBox from "@/components/DisclaimerBox";
import ClinicalRecommendation from "@/components/ClinicalRecommendation";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ClassificationResult {
  prediction: string;
  confidence: number;
  classes: string[];
  class_probabilities: Record<string, number>;
  gradcam?: string;
}

const CELL_TYPE_INFO: Record<string, { color: string; description: string }> = {
  Dyskeratotic:               { color: "bg-destructive",       description: "Abnormal keratinization — may indicate dysplasia or malignancy" },
  Koilocytotic:               { color: "bg-orange-500",        description: "HPV-associated cytopathic changes — warrants follow-up" },
  Metaplastic:                { color: "bg-yellow-500",        description: "Squamous metaplasia — usually benign transformation" },
  Parabasal:                  { color: "bg-blue-500",          description: "Parabasal cells — seen in atrophy or regeneration" },
  "Superficial-Intermediate": { color: "bg-green-500",         description: "Normal mature squamous cells" },
};

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

const API_URL = "http://localhost:5009/predict/cervical";

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const CervicalCytology = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ClassificationResult | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientDob, setPatientDob] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setResults(null);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const file = fileRef.current?.files?.[0];
    if (!preview || !file) return;

    setLoading(true);
    setResults(null);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error || "Failed to classify image.");
      }

      const data: ClassificationResult = await response.json();
      setResults(data);
    } catch (err: any) {
      const msg = err.message || "An error occurred during classification.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── Results Panel ─────────────────────────────────────────────── */

  const ResultsPanel = () => {
    if (loading) {
      return (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Classifying image…</p>
        </div>
      );
    }

    if (!results) {
      return (
        <div className="text-center py-16 text-muted-foreground">
          <Microscope className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-foreground mb-1">Classification Results</p>
          <p className="text-sm">Upload and classify an image to see results</p>
        </div>
      );
    }

    const info = CELL_TYPE_INFO[results.prediction];
    const sortedProbs = Object.entries(results.class_probabilities).sort(
      ([, a], [, b]) => b - a
    );

    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
        {/* Predicted class */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-foreground">Classification Results</h4>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Predicted Cell Type</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold border bg-primary/10 text-primary border-primary/30">
              {results.prediction}
            </span>
          </div>
          {info && (
            <p className="text-xs text-muted-foreground">{info.description}</p>
          )}
        </div>

        {/* Confidence */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Model Confidence
            </span>
            <span className="font-semibold text-primary">
              {(results.confidence * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(results.confidence * 100).toFixed(1)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--gradient-primary)" }}
            />
          </div>
        </div>

        {/* Class probability bars */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Class Probabilities</h4>
          <div className="space-y-2">
            {sortedProbs.map(([cls, prob]) => {
              const barColor = CELL_TYPE_INFO[cls]?.color ?? "bg-muted-foreground";
              const isPredicted = cls === results.prediction;
              return (
                <div key={cls} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={isPredicted ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {cls}
                    </span>
                    <span className={isPredicted ? "font-semibold text-foreground" : "text-muted-foreground"}>
                      {(prob * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${barColor}`}
                      style={{ width: `${(prob * 100).toFixed(1)}%`, opacity: isPredicted ? 1 : 0.5 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interpretation + Download */}
        <div className="flex items-center justify-between rounded-lg border border-border/50 bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground">
            Predicted cell class: <strong>{results.prediction}</strong>.
            Confidence: <strong>{(results.confidence * 100).toFixed(1)}%</strong>.
            Clinical correlation is recommended.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="ml-3 shrink-0"
            onClick={() =>
              generateCervicalReport({
                prediction: results.prediction,
                confidence: results.confidence,
                classProbabilities: results.class_probabilities,
                originalImage: preview ?? undefined,
                gradcamImage: results.gradcam,
                patientName: patientName || undefined,
                patientId: patientId || undefined,
                patientDob: patientDob || undefined,
              })
            }
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> PDF Report
          </Button>
        </div>

        {/* Grad-CAM heatmap */}
        {results.gradcam && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" /> Grad-CAM Visualization
            </h4>
            <p className="text-xs text-muted-foreground">
              Highlights image regions that most influenced the model's classification. Warmer colors indicate higher activation.
            </p>
            <div className="rounded-xl overflow-hidden border border-border/50">
              <img
                src={`data:image/png;base64,${results.gradcam}`}
                alt="Grad-CAM heatmap"
                className="w-full"
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Gradient-weighted Class Activation Mapping (Grad-CAM) — Selvaraju et al., 2017
            </p>
          </div>
        )}
      </motion.div>
    );
  };

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PageHeader
          icon={<Microscope className="w-7 h-7 text-primary" />}
          title="Cervical Cytology – Image Classification"
          subtitle="CNN-based Pap smear cell classification for cervical cancer screening. Upload a cytology image to receive an AI-powered cell type prediction with Grad-CAM visual explanation."
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Upload Form */}
          <div className="space-y-6">
            <GlassCard hover={false}>
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">Patient & Image Upload</h3>

              {/* Patient Info Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Patient Name</label>
                  <input
                    type="text"
                    value={patientName}
                    onChange={(e) => setPatientName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Patient ID</label>
                  <input
                    type="text"
                    value={patientId}
                    onChange={(e) => setPatientId(e.target.value)}
                    placeholder="PAT-00123"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Date of Birth</label>
                  <input
                    type="date"
                    value={patientDob}
                    onChange={(e) => setPatientDob(e.target.value)}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div
                  onClick={() => fileRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors min-h-[200px]"
                >
                  {preview ? (
                    <img src={preview} alt="Preview" className="max-h-48 rounded-xl" />
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">
                        Click to upload Pap smear image
                      </p>
                      <p className="text-xs text-muted-foreground">Accepts .jpg, .png, .bmp</p>
                    </>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.bmp"
                  aria-label="Upload Pap smear image"
                  className="hidden"
                  onChange={handleFile}
                />

                <Button
                  type="submit"
                  disabled={!preview || loading}
                  className="w-full mt-6"
                  style={{ background: "var(--gradient-primary)" }}
                >
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Classifying…</> : "Classify Image"}
                </Button>

                {error && (
                  <div className="mt-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5 text-sm text-destructive">
                    {error}
                  </div>
                )}
              </form>
            </GlassCard>

            {/* Clinical Recommendation below upload */}
            {results && <ClinicalRecommendation prediction={results.prediction} />}
          </div>

          {/* Results */}
          <div className="space-y-6">
            <GlassCard hover={false}>
              <ResultsPanel />
            </GlassCard>
            <DisclaimerBox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CervicalCytology;
