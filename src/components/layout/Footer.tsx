
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative">
      {/* Gradient overlay for smooth transition */}
      <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-transparent via-white/20 to-transparent pointer-events-none" />
      
      {/* Main footer container with elevated card design */}
      <div className="bg-gradient-to-br from-mint-500 via-mint-600 to-mint-700 relative">
        {/* Subtle top border with shadow effect */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-2 shadow-2xl shadow-mint-900/20" />
        
        {/* Content container */}
        <div className="max-w-7xl mx-auto py-12 px-6 relative">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.1),transparent_70%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.05),transparent_70%)]" />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
            <div>
              <h3 className="text-sm font-bold text-white/90 tracking-wider uppercase mb-4 drop-shadow-sm">Product</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/features" className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1 block drop-shadow-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1 block drop-shadow-sm">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/90 tracking-wider uppercase mb-4 drop-shadow-sm">Company</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1 block drop-shadow-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1 block drop-shadow-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1 block drop-shadow-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/90 tracking-wider uppercase mb-4 drop-shadow-sm">Legal</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/privacy" className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1 block drop-shadow-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1 block drop-shadow-sm">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white/90 tracking-wider uppercase mb-4 drop-shadow-sm">Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/help" className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1 block drop-shadow-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-sm text-white/80 hover:text-white transition-all duration-300 hover:translate-x-1 block drop-shadow-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Enhanced divider with subtle glow */}
          <div className="mt-10 pt-8 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent transform translate-y-px" />
            
            <p className="text-sm text-white/70 text-center drop-shadow-sm font-medium">
              &copy; {new Date().getFullYear()} PrepGenie. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
