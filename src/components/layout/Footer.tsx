
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="relative mt-auto">
      {/* Subtle gradient transition from content to footer */}
      <div className="absolute inset-x-0 top-0 h-4 bg-gradient-to-b from-transparent via-white/10 to-transparent pointer-events-none" />
      
      {/* Main footer container with seamless integration */}
      <div className="bg-gradient-to-br from-mint-500 via-mint-600 to-mint-700 relative">
        {/* Enhanced visual connection with content above */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <div className="absolute inset-x-0 top-0 h-1 shadow-lg shadow-mint-900/10" />
        
        {/* Content container with better spacing for scale */}
        <div className="max-w-7xl mx-auto py-8 px-6 relative">
          {/* Refined decorative background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(255,255,255,0.08),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,rgba(255,255,255,0.04),transparent_60%)]" />
          </div>
          
          {/* Compact footer grid for better scaling */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
            <div>
              <h3 className="text-sm font-semibold text-white/95 tracking-wide uppercase mb-3 drop-shadow-sm">Product</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/features" className="text-sm text-white/80 hover:text-white transition-colors duration-200 block drop-shadow-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-sm text-white/80 hover:text-white transition-colors duration-200 block drop-shadow-sm">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/95 tracking-wide uppercase mb-3 drop-shadow-sm">Company</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-sm text-white/80 hover:text-white transition-colors duration-200 block drop-shadow-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-white/80 hover:text-white transition-colors duration-200 block drop-shadow-sm">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/95 tracking-wide uppercase mb-3 drop-shadow-sm">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-sm text-white/80 hover:text-white transition-colors duration-200 block drop-shadow-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-sm text-white/80 hover:text-white transition-colors duration-200 block drop-shadow-sm">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white/95 tracking-wide uppercase mb-3 drop-shadow-sm">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/help" className="text-sm text-white/80 hover:text-white transition-colors duration-200 block drop-shadow-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/faq" className="text-sm text-white/80 hover:text-white transition-colors duration-200 block drop-shadow-sm">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Streamlined divider and copyright */}
          <div className="mt-6 pt-6 relative">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            
            <p className="text-sm text-white/75 text-center drop-shadow-sm font-medium">
              &copy; {new Date().getFullYear()} PrepGenie. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
