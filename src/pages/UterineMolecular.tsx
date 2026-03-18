import { useState } from "react";
import { motion } from "framer-motion";
import { Dna, Loader2, Activity, HeartPulse, AlertCircle } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import DisclaimerBox from "@/components/DisclaimerBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ShapValue {
  feature: string;
  shap_value: number;
  direction: "increases risk" | "decreases risk";
}

interface PredictionResponse {
  subtype: {
    prediction: string;
    confidence: number;
    probabilities: Record<string, number>;
  };
  survival: {
    prediction: string;
    probability_deceased: number;
    risk_tier: string;
  };
  shap_explanation: ShapValue[];
  disclaimer: string;
}

const formatSubtype = (subtype: string) =>
  subtype.replace("UCEC_", "").replace("_", " ");

const RISK_COLORS: Record<string, string> = {
  Low: "#27ae60",
  Intermediate: "#f39c12",
  High: "#e74c3c",
};

const API_URL = "http://localhost:5008/predict/uterine-tcga";

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const UterineMolecular = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    mutation_count: "",
    fraction_genome_altered: "",
    msi_mantis_score: "",
    msisensor_score: "",
    diagnosis_age: "",
    race_category: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.race_category) {
      toast.error("Please select a Race/Ethnicity");
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mutation_count: Number(formData.mutation_count),
          fraction_genome_altered: Number(formData.fraction_genome_altered),
          msi_mantis_score: Number(formData.msi_mantis_score),
          msisensor_score: Number(formData.msisensor_score),
          diagnosis_age: Number(formData.diagnosis_age),
          race_category: formData.race_category,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error || `Server returned ${res.status}`);
      }

      const data: PredictionResponse = await res.json();
      setResults(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Prediction generated successfully!");
    } catch (err: any) {
      const msg = err.message || "Failed to reach the prediction server.";
      setError(msg);
      toast.error("Prediction failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PageHeader
          icon={<Dna className="w-7 h-7 text-medical-teal" />}
          title="Uterine Cancer – Molecular TCGA"
          subtitle="TCGA-based molecular subtype prediction and survival risk analysis. Classifies endometrial tumors into four molecular subtypes based on genomic markers."
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* ── Input Form ── */}
          <GlassCard hover={false}>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Genomic Features */}
              <div className="flex items-center gap-2 mb-2">
                <Dna className="w-5 h-5 text-medical-teal" />
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Genomic Features
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Mutation Count</Label>
                  <Input
                    type="number"
                    name="mutation_count"
                    placeholder="e.g. 65"
                    value={formData.mutation_count}
                    onChange={handleChange}
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>Fraction Genome Altered</Label>
                  <Input
                    type="number"
                    name="fraction_genome_altered"
                    placeholder="e.g. 0.3311"
                    step="0.01"
                    value={formData.fraction_genome_altered}
                    onChange={handleChange}
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>MSI MANTIS Score</Label>
                  <Input
                    type="number"
                    name="msi_mantis_score"
                    placeholder="e.g. 0.3234"
                    step="0.01"
                    value={formData.msi_mantis_score}
                    onChange={handleChange}
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>MSIsensor Score</Label>
                  <Input
                    type="number"
                    name="msisensor_score"
                    placeholder="e.g. 0.85"
                    step="0.01"
                    value={formData.msisensor_score}
                    onChange={handleChange}
                    className="mt-1.5"
                    required
                  />
                </div>
              </div>

              {/* Clinical Features */}
              <div className="flex items-center gap-2 mb-2 pt-2">
                <HeartPulse className="w-5 h-5 text-medical-indigo" />
                <h3 className="font-display font-semibold text-lg text-foreground">
                  Clinical Features
                </h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age at Diagnosis</Label>
                  <Input
                    type="number"
                    name="diagnosis_age"
                    placeholder="e.g. 59"
                    value={formData.diagnosis_age}
                    onChange={handleChange}
                    className="mt-1.5"
                    required
                  />
                </div>
                <div>
                  <Label>Race / Ethnicity</Label>
                  <Select
                    value={formData.race_category}
                    onValueChange={(val) => handleSelectChange("race_category", val)}
                  >
                    <SelectTrigger className="mt-1.5">
                      <SelectValue placeholder="Select race" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="White">White</SelectItem>
                      <SelectItem value="Black or African American">Black or African American</SelectItem>
                      <SelectItem value="Asian">Asian</SelectItem>
                      <SelectItem value="Native Hawaiian or Other Pacific Islander">Native Hawaiian or Other Pacific Islander</SelectItem>
                      <SelectItem value="American Indian or Alaska Native">American Indian or Alaska Native</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded-lg p-3">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full mt-2"
                style={{ background: "var(--gradient-accent)" }}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {loading ? "Analyzing Molecular Data..." : "Predict Subtype & Survival"}
              </Button>
            </form>
          </GlassCard>

          {/* ── Results Panel ── */}
          <div className="space-y-6">
            <GlassCard hover={false}>
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">
                Prediction Results
              </h3>

              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-medical-teal mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Analyzing molecular profile...</p>
                </div>
              )}

              {!loading && !results && (
                <div className="text-center py-12 text-muted-foreground">
                  <Dna className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Enter genomic and clinical features to predict molecular subtype and survival outcome.</p>
                </div>
              )}

              {!loading && results && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  {/* Subtype */}
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Molecular Subtype
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-foreground">
                        {formatSubtype(results.subtype.prediction)}
                      </span>
                      <span className="text-sm font-semibold text-medical-teal">
                        {(results.subtype.confidence * 100).toFixed(1)}% confidence
                      </span>
                    </div>
                  </div>

                  {/* Survival */}
                  <div className="rounded-xl border border-border/50 bg-muted/30 p-4 space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                      Survival Risk
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        {results.survival.prediction}
                      </span>
                      <span
                        className="text-sm font-bold"
                        style={{ color: RISK_COLORS[results.survival.risk_tier] || "inherit" }}
                      >
                        {results.survival.risk_tier} — {(results.survival.probability_deceased * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* SHAP Explanation */}
                  {results.shap_explanation?.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">Key Contributing Factors</h4>
                      <p className="text-xs text-muted-foreground">
                        Top features influencing this prediction (SHAP values)
                      </p>
                      <div className="space-y-2">
                        {results.shap_explanation.map((f, i) => {
                          const maxAbs = Math.max(
                            ...results.shap_explanation.map((s) => Math.abs(s.shap_value))
                          );
                          const widthPct = Math.min((Math.abs(f.shap_value) / maxAbs) * 100, 100);
                          const isRisk = f.direction === "increases risk";
                          return (
                            <div key={i} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-foreground">{f.feature.replace(/_/g, " ")}</span>
                                <span className={isRisk ? "text-destructive" : "text-green-500"}>
                                  {isRisk ? "↑" : "↓"} {Math.abs(f.shap_value).toFixed(2)}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${isRisk ? "bg-destructive/70" : "bg-green-500/70"}`}
                                  style={{ width: `${widthPct}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </GlassCard>
            <DisclaimerBox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UterineMolecular;