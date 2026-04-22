import { ChefHat, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="border-t bg-card mt-auto">
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <ChefHat className="h-5 w-5 text-primary" />
            <Sparkles className="h-2.5 w-2.5 text-primary absolute -top-0.5 -right-0.5" />
          </div>
          <span className="font-serif font-semibold">AI Powered Recipe Manager</span>
        </div>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/recipes" className="hover:text-foreground transition-colors">Browse</Link>
          <Link to="/ai/generate" className="hover:text-foreground transition-colors">AI Generator</Link>
          <Link to="/ai/assistant" className="hover:text-foreground transition-colors">AI Assistant</Link>
          <Link to="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
        </div>
        <p className="text-xs text-muted-foreground">© 2026 AI Powered Recipe Manager. All rights reserved.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
