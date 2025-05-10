
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigationContext } from '@/contexts/NavigationContext';
import { ReminderNavPopover } from '@/components/reminders/ReminderNavPopover';
import { DndToggle } from '@/components/dnd/DndToggle';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRequireAuth, UserTier } from '@/hooks/useRequireAuth';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { userProfile } = useRequireAuth();
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;

  const handleLogout = async () => {
    await signOut();
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
                {/* Admin dropdown only for DEAN tier */}
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="flex items-center gap-1">
                        <Shield className="h-4 w-4" />
                        <span>Admin</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to="/admin/users">Users</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/flashcards">Flashcards</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/sections">Sections</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/grades">Grades</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/csv-import">CSV Import</Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link to="/admin/features">Feature Management</Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
                
                {/* DND Toggle */}
                <DndToggle />
                
                {/* Reminders popover */}
                <ReminderNavPopover />
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
                  <Link to="/settings">Settings</Link>
                  {isAdmin && (
                    <>
                      <div className="font-medium text-sm text-muted-foreground pt-2">Admin</div>
                      <Link to="/admin/users">Users</Link>
                      <Link to="/admin/flashcards">Flashcards</Link>
                      <Link to="/admin/sections">Sections</Link>
                      <Link to="/admin/grades">Grades</Link>
                      <Link to="/admin/csv-import">CSV Import</Link>
                      <Link to="/admin/features">Feature Management</Link>
                    </>
                  )}
                  {/* DND Toggle for mobile */}
                  <div className="flex items-center justify-between py-2">
                    <span>Do Not Disturb Mode</span>
                    <DndToggle />
                  </div>
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
