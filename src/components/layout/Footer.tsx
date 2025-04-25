
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-b from-white to-mint-50/30 border-t border-mint-100">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-mint-700 tracking-wider uppercase">Product</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/features" className="text-base text-gray-600 hover:text-mint-700">
                  Features
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-base text-gray-600 hover:text-mint-700">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-base text-gray-600 hover:text-mint-700">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-mint-700 tracking-wider uppercase">Company</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/about" className="text-base text-gray-600 hover:text-mint-700">
                  About
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-base text-gray-600 hover:text-mint-700">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-base text-gray-600 hover:text-mint-700">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-mint-700 tracking-wider uppercase">Legal</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/privacy" className="text-base text-gray-600 hover:text-mint-700">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-base text-gray-600 hover:text-mint-700">
                  Terms
                </Link>
              </li>
              <li>
                <Link to="/cookies" className="text-base text-gray-600 hover:text-mint-700">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-mint-700 tracking-wider uppercase">Support</h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link to="/support" className="text-base text-gray-600 hover:text-mint-700">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/status" className="text-base text-gray-600 hover:text-mint-700">
                  Status
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-mint-100 pt-8">
          <p className="text-base text-mint-600 text-center">
            &copy; {new Date().getFullYear()} StudyAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
