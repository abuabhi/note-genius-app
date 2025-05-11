
import { Link } from 'react-router-dom';

interface DesktopNavLinksProps {
  isPublicRoute: boolean;
}

export const DesktopNavLinks = ({ isPublicRoute }: DesktopNavLinksProps) => {
  // Only render on public routes
  if (!isPublicRoute) return null;
  
  return (
    <div className="flex items-center space-x-8">
      <Link to="/about" className="text-mint-700 hover:text-mint-900">About</Link>
      <Link to="/blog" className="text-mint-700 hover:text-mint-900">Blog</Link>
      <Link to="/features" className="text-mint-700 hover:text-mint-900">Features</Link>
      <Link to="/pricing" className="text-mint-700 hover:text-mint-900">Pricing</Link>
    </div>
  );
};
