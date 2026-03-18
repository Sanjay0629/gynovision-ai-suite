import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2, AlertCircle, CheckCircle2, ChevronRight, Download } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import DisclaimerBox from "@/components/DisclaimerBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { generateUterineReport } from "@/utils/generateUterineReport";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ShapFeature {
  feature: string;
  shap_value: number;
  direction: string;
}

interface PredictionResponse {
  prediction: number;
  probability: number;
  risk_tier: string;
  risk_color: string;
  threshold_used: { low_upper: number; high_lower: number };
  shap_explanation: ShapFeature[];
  clinical_recommendations: string[];
  disclaimer: string;
}

/* ------------------------------------------------------------------ */
/*  Default form state                                                 */
/* ------------------------------------------------------------------ */

const initialFormData = {
  Age: "",
  BMI: "",
  MenopauseStatus: "",
  AbnormalBleeding: false,
  PelvicPain: false,
  VaginalDischarge: false,
  UnexplainedWeightLoss: false,
  ThickEndometrium: "",
  CA125_Level: "",
  Hypertension: false,
  Diabetes: false,
  FamilyHistoryCancer: false,
  Smoking: false,
  EstrogenTherapy: false,
  HistologyType: "",
  Parity: "",
  Gravidity: "",
  HormoneReceptorStatus: "",
};

/* ------------------------------------------------------------------ */
/*  Sub-components                                                     */
/* ------------------------------------------------------------------ */

const SectionHeader = ({ title, count }: { title: string; count: number }) => (
  <div className="flex items-center gap-2 pt-4 pb-2 border-b border-border/50">
    <h4 className="text-sm font-semibold text-foreground">{title}</h4>
    <span className="text-xs text-muted-foreground">({count} fields)</span>
  </div>
);

const ToggleRow = ({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div className="flex items-center justify-between py-2">
    <Label className="text-sm text-foreground">{label}</Label>
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">{checked ? "Yes" : "No"}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  </div>
);

/* ------------------------------------------------------------------ */
/*  Results panel                                                      */
/* ------------------------------------------------------------------ */

const ResultsPanel = ({
  results,
  loading,
}: {
  results: PredictionResponse | null;
  loading: boolean;
}) => {
  if (loading) {
    return (
      <div className="text-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Analyzing clinical data…</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="font-semibold text-foreground mb-1">Prediction Results</p>
        <p className="text-sm">Submit the form to see risk assessment</p>
      </div>
    );
  }

  const pct = (results.probability * 100).toFixed(1);

  const riskColorClass =
    results.risk_tier === "High"
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : results.risk_tier === "Moderate"
      ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/30"
      : "bg-green-500/10 text-green-600 border-green-500/30";

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Risk Tier + Probability */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-foreground">Risk Assessment</h4>

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Risk Tier</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${riskColorClass}`}>
            {results.risk_tier}
          </span>
        </div>

        {/* Probability bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Probability Score</span>
            <span className="font-semibold text-primary">{pct}%</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-muted overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: "var(--gradient-primary)" }}
            />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0%</span>
            <span>Low ≤ {(results.threshold_used.low_upper * 100).toFixed(0)}%</span>
            <span>High ≥ {(results.threshold_used.high_lower * 100).toFixed(0)}%</span>
            <span>100%</span>
          </div>
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

      {/* Clinical Recommendations */}
      {results.clinical_recommendations?.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Clinical Recommendations</h4>
          <div className="space-y-2">
            {results.clinical_recommendations.map((rec, i) => (
              <div key={i} className="flex gap-2 items-start text-sm text-muted-foreground">
                <ChevronRight className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Disclaimer from response */}
      {results.disclaimer && (
        <div className="rounded-lg border border-border/50 bg-muted/30 p-3 flex gap-2 items-start">
          <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">{results.disclaimer}</p>
        </div>
      )}
    </motion.div>
  );
};

/* ------------------------------------------------------------------ */
/*  Main page component                                                */
/* ------------------------------------------------------------------ */

const API_URL = "http://localhost:5007/predict/uterine";

const UterineClinical = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PredictionResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [patientName, setPatientName] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientAge, setPatientAge] = useState("");
  const [referringPhysician, setReferringPhysician] = useState("");

  const setField = (key: keyof typeof initialFormData, value: string | boolean) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const buildPayload = () => ({
    Age: Number(patientAge),
    BMI: Number(formData.BMI),
    MenopauseStatus: formData.MenopauseStatus,
    AbnormalBleeding: formData.AbnormalBleeding ? "Yes" : "No",
    PelvicPain: formData.PelvicPain ? "Yes" : "No",
    VaginalDischarge: formData.VaginalDischarge ? "Yes" : "No",
    UnexplainedWeightLoss: formData.UnexplainedWeightLoss ? "Yes" : "No",
    ThickEndometrium: Number(formData.ThickEndometrium),
    CA125_Level: Number(formData.CA125_Level),
    Hypertension: formData.Hypertension ? "Yes" : "No",
    Diabetes: formData.Diabetes ? "Yes" : "No",
    FamilyHistoryCancer: formData.FamilyHistoryCancer ? "Yes" : "No",
    Smoking: formData.Smoking ? "Yes" : "No",
    EstrogenTherapy: formData.EstrogenTherapy ? "Yes" : "No",
    HistologyType: formData.HistologyType,
    Parity: Number(formData.Parity),
    Gravidity: Number(formData.Gravidity),
    HormoneReceptorStatus: formData.HormoneReceptorStatus,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error || `Server returned ${res.status}`);
      }

      const data: PredictionResponse = await res.json();
      setResults(data);
    } catch (err: any) {
      const msg = err.message || "Failed to reach the prediction server.";
      setError(msg);
      toast.error("Prediction failed", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!results) return;
    generateUterineReport({
      ...results,
      patientName,
      patientId,
      patientAge,
      referringPhysician,
      clinicalInputs: buildPayload(),
    });
    toast.success("PDF report downloaded");
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PageHeader
          icon={<Activity className="w-7 h-7 text-primary" />}
          title="Uterine Cancer – Clinical Prediction"
          subtitle="Enter 18 clinical parameters to receive an AI-powered risk assessment with SHAP explanations and clinical recommendations."
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Input Form */}
          <GlassCard hover={false}>
            <h3 className="font-display font-semibold text-lg text-foreground mb-4">
              Patient Clinical Data
            </h3>

            <form onSubmit={handleSubmit} className="space-y-1">
              {/* Patient Information */}
              <SectionHeader title="Patient Information" count={4} />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label>Patient Name</Label>
                  <Input placeholder="Full name" className="mt-1.5" value={patientName} onChange={(e) => setPatientName(e.target.value)} />
                </div>
                <div>
                  <Label>Patient ID</Label>
                  <Input placeholder="e.g. UT-00123" className="mt-1.5" value={patientId} onChange={(e) => setPatientId(e.target.value)} />
                </div>
                <div>
                  <Label>Age (years)</Label>
                  <Input type="number" min="0" max="150" placeholder="e.g. 55" className="mt-1.5" value={patientAge} onChange={(e) => setPatientAge(e.target.value)} />
                </div>
                <div>
                  <Label>Referring Physician</Label>
                  <Input placeholder="Dr. Name" className="mt-1.5" value={referringPhysician} onChange={(e) => setReferringPhysician(e.target.value)} />
                </div>
              </div>

              {/* Demographics */}
              <SectionHeader title="Demographics" count={3} />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label>Age (clinical input)</Label>
                  <Input type="number" placeholder="e.g. 62" className="mt-1.5" value={formData.Age} onChange={(e) => setField("Age", e.target.value)} required />
                </div>
                <div>
                  <Label>BMI (kg/m²)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 31.5" className="mt-1.5" value={formData.BMI} onChange={(e) => setField("BMI", e.target.value)} required />
                </div>
              </div>
              <div className="pt-2">
                <Label>Menopause Status</Label>
                <Select value={formData.MenopauseStatus} onValueChange={(v) => setField("MenopauseStatus", v)} required>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premenopausal">Premenopausal</SelectItem>
                    <SelectItem value="Perimenopausal">Perimenopausal</SelectItem>
                    <SelectItem value="Postmenopausal">Postmenopausal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Symptoms */}
              <SectionHeader title="Symptoms" count={4} />
              <div className="pt-1">
                <ToggleRow label="Abnormal Bleeding" checked={formData.AbnormalBleeding} onChange={(v) => setField("AbnormalBleeding", v)} />
                <ToggleRow label="Pelvic Pain" checked={formData.PelvicPain} onChange={(v) => setField("PelvicPain", v)} />
                <ToggleRow label="Vaginal Discharge" checked={formData.VaginalDischarge} onChange={(v) => setField("VaginalDischarge", v)} />
                <ToggleRow label="Unexplained Weight Loss" checked={formData.UnexplainedWeightLoss} onChange={(v) => setField("UnexplainedWeightLoss", v)} />
              </div>

              {/* Clinical Measurements */}
              <SectionHeader title="Clinical Measurements" count={2} />
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label>Endometrial Thickness (mm)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 18.5" className="mt-1.5" value={formData.ThickEndometrium} onChange={(e) => setField("ThickEndometrium", e.target.value)} required />
                </div>
                <div>
                  <Label>CA-125 Level (U/mL)</Label>
                  <Input type="number" step="0.1" placeholder="e.g. 65.3" className="mt-1.5" value={formData.CA125_Level} onChange={(e) => setField("CA125_Level", e.target.value)} required />
                </div>
              </div>

              {/* Medical History */}
              <SectionHeader title="Medical History" count={5} />
              <div className="pt-1">
                <ToggleRow label="Hypertension" checked={formData.Hypertension} onChange={(v) => setField("Hypertension", v)} />
                <ToggleRow label="Diabetes" checked={formData.Diabetes} onChange={(v) => setField("Diabetes", v)} />
                <ToggleRow label="Family History of Cancer" checked={formData.FamilyHistoryCancer} onChange={(v) => setField("FamilyHistoryCancer", v)} />
                <ToggleRow label="Smoking" checked={formData.Smoking} onChange={(v) => setField("Smoking", v)} />
                <ToggleRow label="Estrogen Therapy" checked={formData.EstrogenTherapy} onChange={(v) => setField("EstrogenTherapy", v)} />
              </div>

              {/* Pathology / Reproductive */}
              <SectionHeader title="Pathology & Reproductive" count={4} />
              <div className="pt-2">
                <Label>Histology Type</Label>
                <Select value={formData.HistologyType} onValueChange={(v) => setField("HistologyType", v)} required>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Normal">Normal</SelectItem>
                    <SelectItem value="Endometrioid">Endometrioid</SelectItem>
                    <SelectItem value="Serous">Serous</SelectItem>
                    <SelectItem value="Clear Cell">Clear Cell</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <Label>Parity (live births)</Label>
                  <Input type="number" placeholder="e.g. 2" className="mt-1.5" value={formData.Parity} onChange={(e) => setField("Parity", e.target.value)} required />
                </div>
                <div>
                  <Label>Gravidity (pregnancies)</Label>
                  <Input type="number" placeholder="e.g. 3" className="mt-1.5" value={formData.Gravidity} onChange={(e) => setField("Gravidity", e.target.value)} required />
                </div>
              </div>
              <div className="pt-2">
                <Label>Hormone Receptor Status</Label>
                <Select value={formData.HormoneReceptorStatus} onValueChange={(v) => setField("HormoneReceptorStatus", v)} required>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Positive">Positive</SelectItem>
                    <SelectItem value="Negative">Negative</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-6">
                <Button type="submit" disabled={loading} className="flex-1" style={{ background: "var(--gradient-primary)" }}>
                  {loading ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Predicting…</> : "Predict Risk"}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset}>Reset</Button>
              </div>

              {error && (
                <div className="mt-3 p-3 rounded-lg border border-destructive/30 bg-destructive/5 flex gap-2 items-center text-sm text-destructive">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}
            </form>
          </GlassCard>

          {/* Results */}
          <div className="space-y-6">
            <GlassCard hover={false}>
              <ResultsPanel results={results} loading={loading} />
              {results && !loading && (
                <div className="pt-4 border-t border-border/50 mt-6">
                  <Button onClick={handleDownloadPDF} variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF Report
                  </Button>
                </div>
              )}
            </GlassCard>
            <DisclaimerBox />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UterineClinical;
