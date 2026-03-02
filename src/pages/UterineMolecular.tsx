import { useState } from "react";
import { motion } from "framer-motion";
import { Dna, Loader2, Info } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import GlassCard from "@/components/GlassCard";
import MolecularBadge from "@/components/MolecularBadge";
import ConfidenceBar from "@/components/ConfidenceBar";
import DisclaimerBox from "@/components/DisclaimerBox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const UterineMolecular = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | { subtype: string; survivalRisk: string; confidence: number }>(null);

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({ subtype: "MSI", survivalRisk: "Favorable", confidence: 91 });
      setLoading(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4">
        <PageHeader
          icon={<Dna className="w-7 h-7 text-medical-teal" />}
          title="Uterine Cancer – Molecular Prognostics"
          subtitle="TCGA-based molecular subtype classification for personalized prognosis and treatment guidance."
        />

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <GlassCard hover={false}>
            <div className="flex items-center gap-2 mb-6">
              <h3 className="font-display font-semibold text-lg text-foreground">Molecular Input Panel</h3>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="w-4 h-4 text-muted-foreground" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-xs">Based on TCGA molecular classification: POLE ultramutated, MSI hypermutated, Copy Number Low, Copy Number High.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="space-y-4">
              <div>
                <Label>Mutation Count</Label>
                <Input type="number" placeholder="e.g. 150" className="mt-1.5" />
              </div>
              <div>
                <Label>MSI Score</Label>
                <Input type="number" placeholder="e.g. 0.85" className="mt-1.5" />
              </div>
              <div>
                <Label>Copy Number Variation Index</Label>
                <Input type="number" placeholder="e.g. 0.32" className="mt-1.5" />
              </div>
              <div>
                <Label>POLE Mutation Status</Label>
                <Input placeholder="e.g. Positive / Negative" className="mt-1.5" />
              </div>
              <Button
                onClick={handlePredict}
                disabled={loading}
                className="w-full mt-2"
                style={{ background: "var(--gradient-accent)" }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {loading ? "Classifying..." : "Predict Prognosis"}
              </Button>
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard hover={false}>
              <h3 className="font-display font-semibold text-lg text-foreground mb-6">Prognostic Results</h3>
              {!result && !loading && (
                <div className="text-center py-12 text-muted-foreground">
                  <Dna className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Submit molecular data to classify subtype</p>
                </div>
              )}
              {loading && (
                <div className="text-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-medical-teal mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">Analyzing molecular profile...</p>
                </div>
              )}
              {result && !loading && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Molecular Subtype</span>
                    <MolecularBadge subtype={result.subtype} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Survival Risk</span>
                    <span className="text-sm font-semibold text-foreground">{result.survivalRisk}</span>
                  </div>
                  <ConfidenceBar value={result.confidence} label="Classification Confidence" />
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
