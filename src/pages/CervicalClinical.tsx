import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2, CheckCircle2, AlertTriangle, Activity, Shield, FileDown } from "lucide-react";
import { generateCervicalClinicalReport } from "@/utils/generateCervicalClinicalReport";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import DisclaimerBox from "@/components/DisclaimerBox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ShapEntry {
  feature: string;
  shap_value: number;
  direction: "increases risk" | "decreases risk";
}

interface PredictionResult {
  cancer_probability: number;
  risk_label: "Low Risk" | "Moderate Risk" | "High Risk";
  thresholds: { T1: number; T2: number };
  shap_explanation: ShapEntry[];
  cds_guidance: { summary: string; actions: string[] };
}

/* ------------------------------------------------------------------ */
/*  Initial form state                                                 */
/* ------------------------------------------------------------------ */

const INITIAL_FORM: Record<string, string> = {
  "Age": "", "Number of sexual partners": "", "First sexual intercourse": "",
  "Num of pregnancies": "", "Smokes": "", "Smokes (years)": "", "Smokes (packs/year)": "",
  "Hormonal Contraceptives": "", "Hormonal Contraceptives (years)": "",
  "IUD": "", "IUD (years)": "",
  "STDs": "", "STDs (number)": "", "STDs:condylomatosis": "",
  "STDs:cervical condylomatosis": "", "STDs:vaginal condylomatosis": "",
  "STDs:vulvo-perineal condylomatosis": "", "STDs:syphilis": "",
  "STDs:pelvic inflammatory disease": "", "STDs:genital herpes": "",
  "STDs:molluscum contagiosum": "", "STDs:AIDS": "", "STDs:HIV": "",
  "STDs:Hepatitis B": "", "STDs:HPV": "", "STDs: Number of diagnosis": "",
  "STDs: Time since first diagnosis": "", "STDs: Time since last diagnosis": "",
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const NumInput = ({
  label, field, placeholder, optional, value, onChange,
}: {
  label: string; field: string; placeholder?: string; optional?: boolean;
  value: string; onChange: (f: string, v: string) => void;
}) => (
  <div>
    <Label className="text-sm">
      {label}{optional && <span className="text-muted-foreground ml-1">(optional)</span>}
    </Label>
    <Input
      type="number"
      placeholder={placeholder ?? ""}
      value={value}
      onChange={(e) => onChange(field, e.target.value)}
      className="mt-1.5"
    />
  </div>
);

const YesNoSelect = ({
  label, field, value, onChange,
}: {
  label: string; field: string; value: string; onChange: (f: string, v: string) => void;
}) => (
  <div>
    <Label className="text-sm">{label}</Label>
    <Select value={value} onValueChange={(v) => onChange(field, v)}>
      <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select…" /></SelectTrigger>
      <SelectContent>
        <SelectItem value="1">Yes</SelectItem>
        <SelectItem value="0">No</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const SectionHeader = ({ title }: { title: string }) => (
  <div className="pt-4 pb-2 border-b border-border/50 mb-4">
    <h4 className="font-display font-semibold text-sm text-primary">{title}</h4>
  </div>
);

const RiskIcon = ({ label }: { label: string }) => {
  if (label === "High Risk") return <AlertTriangle className="w-5 h-5 text-destructive" />;
  if (label === "Moderate Risk") return <Activity className="w-5 h-5 text-yellow-500" />;
  return <Shield className="w-5 h-5 text-green-500" />;
};

const riskColor = (label: string) => {
  if (label === "High Risk") return "bg-destructive/10 text-destructive border-destructive/30";
  if (label === "Moderate Risk") return "bg-yellow-500/10 text-yellow-600 border-yellow-500/30";
  return "bg-green-500/10 text-green-600 border-green-500/30";
};

/* ------------------------------------------------------------------ */
/*  API                                                                */
/* ------------------------------------------------------------------ */

const API_URL = "http://localhost:5010/predict";

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

const CervicalClinical = () => {
  const [form, setForm] = useState<Record<string, string>>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<PredictionResult | null>(null);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResults(null);

    const payload: Record<string, number | null> = {};
    for (const [key, val] of Object.entries(form)) {
      payload[key] = val === "" ? null : parseFloat(val);
    }

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Server error");
      setResults(json as PredictionResult);
    } catch (err: any) {
      const msg = err.message ?? "Failed to reach the prediction server.";
      setError(msg);
      toast.error("Prediction failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setResults(null);
    setError(null);
  };

  const maxShapAbs = results
    ? Math.max(...results.shap_explanation.map((s) => Math.abs(s.shap_value)), 0.001)
    : 1;

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PageHeader
          icon={<Brain className="w-7 h-7 text-medical-indigo" />}
          title="Cervical Cancer – Clinical Prediction"
          subtitle="Clinical risk stratification for cervical cancer using structured patient data and machine learning models."
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* ── Form ── */}
          <GlassCard hover={false}>
            <h3 className="font-display font-semibold text-lg text-foreground mb-2">Patient Clinical Data</h3>
            <p className="text-sm text-muted-foreground mb-6">Enter clinical parameters for cervical cancer risk assessment.</p>

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Section A */}
              <SectionHeader title="A — Demographics & Lifestyle" />
              <div className="grid grid-cols-2 gap-4">
                <NumInput label="Age" field="Age" placeholder="e.g. 30" value={form["Age"]} onChange={handleChange} />
                <NumInput label="Sexual Partners" field="Number of sexual partners" placeholder="e.g. 2" value={form["Number of sexual partners"]} onChange={handleChange} />
                <NumInput label="First Intercourse (age)" field="First sexual intercourse" placeholder="e.g. 18" value={form["First sexual intercourse"]} onChange={handleChange} />
                <NumInput label="Pregnancies" field="Num of pregnancies" placeholder="e.g. 2" value={form["Num of pregnancies"]} onChange={handleChange} />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <YesNoSelect label="Smokes" field="Smokes" value={form["Smokes"]} onChange={handleChange} />
                <NumInput label="Smoking Years" field="Smokes (years)" placeholder="e.g. 5" optional value={form["Smokes (years)"]} onChange={handleChange} />
              </div>
              <NumInput label="Packs/Year" field="Smokes (packs/year)" placeholder="e.g. 1.5" optional value={form["Smokes (packs/year)"]} onChange={handleChange} />

              {/* Section B */}
              <SectionHeader title="B — Contraception & IUD" />
              <div className="grid grid-cols-2 gap-4">
                <YesNoSelect label="Hormonal Contraceptives" field="Hormonal Contraceptives" value={form["Hormonal Contraceptives"]} onChange={handleChange} />
                <NumInput label="HC Years" field="Hormonal Contraceptives (years)" placeholder="e.g. 3" optional value={form["Hormonal Contraceptives (years)"]} onChange={handleChange} />
                <YesNoSelect label="IUD" field="IUD" value={form["IUD"]} onChange={handleChange} />
                <NumInput label="IUD Years" field="IUD (years)" placeholder="e.g. 2" optional value={form["IUD (years)"]} onChange={handleChange} />
              </div>

              {/* Section C */}
              <SectionHeader title="C — STD History" />
              <div className="grid grid-cols-2 gap-4">
                <YesNoSelect label="STDs" field="STDs" value={form["STDs"]} onChange={handleChange} />
                <NumInput label="STDs (number)" field="STDs (number)" placeholder="e.g. 0" value={form["STDs (number)"]} onChange={handleChange} />
                <YesNoSelect label="Condylomatosis" field="STDs:condylomatosis" value={form["STDs:condylomatosis"]} onChange={handleChange} />
                <YesNoSelect label="Cervical Condylomatosis" field="STDs:cervical condylomatosis" value={form["STDs:cervical condylomatosis"]} onChange={handleChange} />
                <YesNoSelect label="Vaginal Condylomatosis" field="STDs:vaginal condylomatosis" value={form["STDs:vaginal condylomatosis"]} onChange={handleChange} />
                <YesNoSelect label="Vulvo-perineal Condylomatosis" field="STDs:vulvo-perineal condylomatosis" value={form["STDs:vulvo-perineal condylomatosis"]} onChange={handleChange} />
                <YesNoSelect label="Syphilis" field="STDs:syphilis" value={form["STDs:syphilis"]} onChange={handleChange} />
                <YesNoSelect label="Pelvic Inflammatory Disease" field="STDs:pelvic inflammatory disease" value={form["STDs:pelvic inflammatory disease"]} onChange={handleChange} />
                <YesNoSelect label="Genital Herpes" field="STDs:genital herpes" value={form["STDs:genital herpes"]} onChange={handleChange} />
                <YesNoSelect label="Molluscum Contagiosum" field="STDs:molluscum contagiosum" value={form["STDs:molluscum contagiosum"]} onChange={handleChange} />
                <YesNoSelect label="AIDS" field="STDs:AIDS" value={form["STDs:AIDS"]} onChange={handleChange} />
                <YesNoSelect label="HIV" field="STDs:HIV" value={form["STDs:HIV"]} onChange={handleChange} />
                <YesNoSelect label="Hepatitis B" field="STDs:Hepatitis B" value={form["STDs:Hepatitis B"]} onChange={handleChange} />
                <YesNoSelect label="HPV" field="STDs:HPV" value={form["STDs:HPV"]} onChange={handleChange} />
                <NumInput label="Number of Diagnoses" field="STDs: Number of diagnosis" placeholder="e.g. 0" value={form["STDs: Number of diagnosis"]} onChange={handleChange} />
                <NumInput label="Time Since First Diagnosis" field="STDs: Time since first diagnosis" placeholder="years" optional value={form["STDs: Time since first diagnosis"]} onChange={handleChange} />
              </div>
              <NumInput label="Time Since Last Diagnosis" field="STDs: Time since last diagnosis" placeholder="years" optional value={form["STDs: Time since last diagnosis"]} onChange={handleChange} />

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Button type="submit" disabled={loading} className="flex-1" style={{ background: "var(--gradient-primary)" }}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {loading ? "Predicting…" : "Predict Cervical Cancer Risk"}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
              </div>

              {error && (
                <div className="rounded-xl bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive mt-2">
                  {error}
                </div>
              )}
            </form>
          </GlassCard>

          {/* ── Results ── */}
          <div className="space-y-6">
            <GlassCard hover={false}>
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">Prediction Results</h3>

              {!results && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Submit clinical data to see prediction results</p>
                </div>
              )}

              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Analyzing data…</p>
                </div>
              )}

              {results && !loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  {/* Risk badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Level</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold border ${riskColor(results.risk_label)}`}>
                      <RiskIcon label={results.risk_label} />
                      {results.risk_label}
                    </span>
                  </div>

                  {/* Probability bar */}
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-medium text-foreground">Cancer Probability</span>
                      <span className="text-sm font-semibold text-primary">{(results.cancer_probability * 100).toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${results.cancer_probability * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                        className="h-full rounded-full"
                        style={{ background: "var(--gradient-primary)" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Moderate: ≥{(results.thresholds.T1 * 100).toFixed(1)}% | High: ≥{(results.thresholds.T2 * 100).toFixed(1)}%
                    </p>
                  </div>

                  {/* SHAP */}
                  {results.shap_explanation?.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-3">Top Contributing Factors</h4>
                      <div className="space-y-3">
                        {results.shap_explanation.map((entry, i) => {
                          const widthPct = Math.min((Math.abs(entry.shap_value) / maxShapAbs) * 100, 100);
                          const isRisk = entry.direction === "increases risk";
                          return (
                            <div key={i}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">{entry.feature.replace(/_/g, " ")}</span>
                                <span className={isRisk ? "text-destructive" : "text-green-600"}>
                                  {isRisk ? "▲" : "▼"} {Math.abs(entry.shap_value).toFixed(3)}
                                </span>
                              </div>
                              <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${widthPct}%` }}
                                  transition={{ duration: 0.8, delay: 0.1 * i }}
                                  className={`h-full rounded-full ${isRisk ? "bg-destructive/70" : "bg-green-500/70"}`}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CDS Guidance */}
                  {results.cds_guidance && (
                    <div className="rounded-xl bg-muted/50 p-4 space-y-3">
                      <h4 className="text-sm font-semibold text-foreground">Clinical Decision Support</h4>
                      <p className="text-sm text-muted-foreground">{results.cds_guidance.summary}</p>
                      <ul className="space-y-2">
                        {results.cds_guidance.actions.map((action, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            {action}
                          </li>
                        ))}
                      </ul>
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

export default CervicalClinical;
