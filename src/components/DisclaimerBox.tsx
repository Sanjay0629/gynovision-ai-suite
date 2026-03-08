import { AlertTriangle } from "lucide-react";

interface DisclaimerBoxProps {
  message?: string;
}

const DisclaimerBox = ({ message = "This tool supports clinical decision-making and does not replace professional medical diagnosis. Always consult a qualified healthcare provider." }: DisclaimerBoxProps) => (
  <div className="rounded-xl border border-risk-moderate/30 bg-risk-moderate/5 p-4 flex gap-3 items-start">
    <AlertTriangle className="w-5 h-5 text-risk-moderate shrink-0 mt-0.5" />
    <p className="text-sm text-muted-foreground leading-relaxed">{message}</p>
  </div>
);

export default DisclaimerBox;
