import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, Loader2 } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import RiskBadge from "@/components/RiskBadge";
import ConfidenceBar from "@/components/ConfidenceBar";
import DisclaimerBox from "@/components/DisclaimerBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const UterineClinical = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { risk: "low" | "moderate" | "high"; probability: number; confidence: number }>(null);

  const handlePredict = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setResult({ risk: "moderate", probability: 67, confidence: 85 });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PageHeader
          icon={<Activity className="w-7 h-7 text-primary" />}
          title="Uterine Cancer – Clinical Prediction"
          subtitle="AI-driven clinical risk assessment based on patient demographics, medical history, and diagnostic markers."
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Input Form */}
          <GlassCard hover={false}>
            <h3 className="font-display font-semibold text-lg text-foreground mb-6">Patient Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Age</Label>
                  <Input type="number" placeholder="e.g. 55" className="mt-1.5" />
                </div>
                <div>
                  <Label>BMI</Label>
                  <Input type="number" placeholder="e.g. 28.5" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label>Menopausal Status</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pre">Pre-menopausal</SelectItem>
                    <SelectItem value="peri">Peri-menopausal</SelectItem>
                    <SelectItem value="post">Post-menopausal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Family History</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Abnormal Bleeding</Label>
                <Select>
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yes">Yes</SelectItem>
                    <SelectItem value="no">No</SelectItem>
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
                {loading ? "Analyzing..." : "Predict Risk"}
              </Button>
            </div>
          </GlassCard>

          {/* Output */}
          <div className="space-y-6">
            <GlassCard hover={false}>
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">Prediction Results</h3>
              {!result && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Activity className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Submit patient data to generate risk prediction</p>
                </div>
              )}
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Processing clinical data...</p>
                </div>
              )}
              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Risk Category</span>
                    <RiskBadge level={result.risk} />
                  </div>
                  <ConfidenceBar value={result.probability} label="Risk Probability" />
                  <ConfidenceBar value={result.confidence} label="Model Confidence" />
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

export default UterineClinical;
