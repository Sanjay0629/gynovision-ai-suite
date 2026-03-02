import { useState } from "react";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import RiskBadge from "@/components/RiskBadge";
import ConfidenceBar from "@/components/ConfidenceBar";
import DisclaimerBox from "@/components/DisclaimerBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CervicalClinical = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { risk: "low" | "moderate" | "high"; probability: number; confidence: number; interpretation: string }>(null);

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        risk: "low",
        probability: 23,
        confidence: 92,
        interpretation: "Based on the provided clinical features, the model indicates a low probability of cervical cancer. Regular screening is recommended."
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PageHeader
          icon={<Brain className="w-7 h-7 text-medical-indigo" />}
          title="Cervical Cancer – Clinical Prediction"
          subtitle="Evidence-based clinical risk assessment using patient demographics and screening history."
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <GlassCard hover={false}>
            <h3 className="font-display font-semibold text-lg text-foreground mb-6">Clinical Input</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input type="number" placeholder="e.g. 42" className="mt-1.5" />
                </div>
                <div>
                  <Label>Number of Pregnancies</Label>
                  <Input type="number" placeholder="e.g. 3" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>HPV Status</Label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">Positive</SelectItem>
                    <SelectItem value="negative">Negative</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Smoking History</Label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="former">Former</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Previous Pap Smear Result</Label>
                <Select>
                  <SelectTrigger className="mt-1.5"><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="abnormal">Abnormal</SelectItem>
                    <SelectItem value="none">No Prior Test</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handlePredict}
                disabled={loading}
                className="w-full mt-2"
                style={{ background: "var(--gradient-primary)" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? "Analyzing..." : "Predict Cervical Cancer Risk"}
              </Button>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard hover={false}>
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">Prediction Output</h3>
              {!result && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Brain className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Submit clinical data to generate prediction</p>
                </div>
              )}
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Processing clinical features...</p>
                </div>
              )}
              {result && !loading && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Classification</span>
                    <RiskBadge level={result.risk} />
                  </div>
                  <ConfidenceBar value={result.probability} label="Risk Probability" />
                  <ConfidenceBar value={result.confidence} label="Model Confidence" />
                  <div className="rounded-xl bg-muted/50 p-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">{result.interpretation}</p>
                  </div>
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
