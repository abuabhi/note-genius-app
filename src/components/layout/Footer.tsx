
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white/80 backdrop-blur-md text-gray-700 border-t border-gray-200/60 shadow-sm mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-6 overflow-hidden">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3">Product</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/features" className="text-sm text-gray-600 hover:text-mint-600 transition-colors duration-200">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-sm text-gray-600 hover:text-mint-600 transition-colors duration-200">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm text-gray-600 hover:text-mint-600 transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm text-gray-600 hover:text-mint-600 transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-gray-600 hover:text-mint-600 transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-mint-600 transition-colors duration-200">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-mint-600 transition-colors duration-200">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase mb-3">Support</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/help" className="text-sm text-gray-600 hover:text-mint-600 transition-colors duration-200">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-sm text-gray-600 hover:text-mint-600 transition-colors duration-200">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-200/60">
          <p className="text-sm text-gray-600 text-center">
            &copy; {new Date().getFullYear()} PrepGenie. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
