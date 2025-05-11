
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
import { Button } from '@/components/ui/button';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { AppLogo } from './navigation/AppLogo';
import { DesktopNavLinks } from './navigation/DesktopNavLinks';
import { DesktopAuthSection } from './navigation/DesktopAuthSection';
import { MobileMenu } from './navigation/MobileMenu';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { user } = useAuth();
  const { userProfile } = useRequireAuth();
  
  // Define which routes are public
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="py-4 border-b">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <AppLogo />
        </div>

        {/* Desktop Navigation - Centered Menu Items */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <DesktopNavLinks isPublicRoute={isPublicRoute} />
        </div>
        
        {/* Desktop Navigation - Right Side - Auth Buttons or User Menu */}
        <DesktopAuthSection 
          userProfile={userProfile} 
          isPublicRoute={isPublicRoute} 
        />

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        <MobileMenu 
          isOpen={isMenuOpen}
          userProfile={userProfile}
          isPublicRoute={isPublicRoute}
        />
      </div>
    </nav>
  );
}
