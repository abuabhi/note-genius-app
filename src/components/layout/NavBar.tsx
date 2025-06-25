
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { AppLogo } from './navigation/AppLogo';
import { DesktopNavLinks } from './navigation/DesktopNavLinks';
import { DesktopAuthSection } from './navigation/DesktopAuthSection';
import { MobileMenu } from './navigation/MobileMenu';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  
  // Define which routes are public
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-200/60 shadow-sm">
      <div className="container mx-auto px-6 h-16 flex justify-between items-center">
        <div className="flex items-center min-w-0">
          <AppLogo />
        </div>

        {/* Desktop Navigation - Centered Menu Items */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <DesktopNavLinks isPublicRoute={isPublicRoute} />
        </div>
        
        {/* Desktop Navigation - Right Side - Auth Buttons or User Menu */}
        <DesktopAuthSection 
          isPublicRoute={isPublicRoute} 
        />

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={toggleMenu}
            className="h-9 w-9 p-0 hover:bg-mint-50 transition-colors"
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu 
          isOpen={isMenuOpen}
          isPublicRoute={isPublicRoute}
        />
      </div>
    </nav>
  );
}
