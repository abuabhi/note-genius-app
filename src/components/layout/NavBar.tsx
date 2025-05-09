
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigationContext } from '@/contexts/NavigationContext';
import { ReminderNavPopover } from '@/components/reminders/ReminderNavPopover';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth(); // Changed from logout to signOut
  const navigate = useNavigate();
  const { menuLinks } = useNavigationContext();

  const handleLogout = async () => {
    await signOut(); // Changed from logout to signOut
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="py-4 border-b">
      <div className="container mx-auto px-6 flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-2xl font-bold flex items-center">
            <span className="text-primary">Study</span>
            <span>App</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup">Sign Up</Link>
            </>
          ) : (
            <>
              <div className="flex items-center gap-4">
                {menuLinks.map((link) => (
                  <Link key={link.href} to={link.href}>
                    {link.label}
                  </Link>
                ))}
                
                {/* Add the ReminderNavPopover component here */}
                <ReminderNavPopover />
                
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={toggleMenu}>
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 w-full bg-white border-b shadow-md z-10">
            <div className="container mx-auto p-6 flex flex-col space-y-4">
              {!user ? (
                <>
                  <Link to="/login">Login</Link>
                  <Link to="/signup">Sign Up</Link>
                </>
              ) : (
                <>
                  {menuLinks.map((link) => (
                    <Link key={link.href} to={link.href}>
                      {link.label}
                    </Link>
                  ))}
                  <Button variant="outline" onClick={handleLogout}>
                    Logout
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
