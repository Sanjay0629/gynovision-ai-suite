import { Brain, Heart } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t border-border/50 bg-card/50 backdrop-blur-sm">
    <div className="container mx-auto px-4 py-12">
      <div className="grid md:grid-cols-3 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Brain className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-foreground">GynoVision AI</span>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Multimodal AI-powered gynecological cancer prediction and clinical decision support system.
          </p>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Modules</h4>
          <div className="flex flex-col gap-2">
            <Link to="/uterine-clinical" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Uterine Clinical</Link>
            <Link to="/uterine-molecular" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Uterine Molecular</Link>
            <Link to="/cervical-clinical" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cervical Clinical</Link>
            <Link to="/cervical-cytology" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Cytology AI</Link>
          </div>
        </div>
        <div>
          <h4 className="font-display font-semibold text-foreground mb-3">Information</h4>
          <div className="flex flex-col gap-2">
            <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</Link>
            
          </div>
        </div>
      </div>
      <div className="border-t border-border/50 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          © 2026 GynoVision AI. For academic and research use only.
        </p>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          Built with <Heart className="w-3 h-3 text-destructive" /> for clinical research
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
