
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/contexts/auth';
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
import { useLocation } from 'react-router-dom';

export default function NavBar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { userProfile } = useRequireAuth();
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;
  
  // Define which routes are public
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(pathname);
  const isHomePage = pathname === '/';

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

        {/* Desktop Navigation - Centered Menu Items */}
        <div className="hidden md:flex items-center justify-center flex-1">
          {/* Public Navigation Links - Always show these links on public routes */}
          {isPublicRoute && (
            <div className="flex items-center space-x-8">
              <Link to="/about" className="text-mint-700 hover:text-mint-900">About</Link>
              <Link to="/blog" className="text-mint-700 hover:text-mint-900">Blog</Link>
              <Link to="/features" className="text-mint-700 hover:text-mint-900">Features</Link>
              <Link to="/pricing" className="text-mint-700 hover:text-mint-900">Pricing</Link>
            </div>
          )}
        </div>
        
        {/* Desktop Navigation - Right Side - Auth Buttons or User Menu */}
        <div className="hidden md:flex items-center space-x-4">
          {/* If user is not authenticated or if we're on the home page, show Login/Signup */}
          {!user ? (
            <>
              <Link to="/login" className="text-mint-700 hover:text-mint-900 font-medium">Login</Link>
              <Button asChild className="bg-mint-500 hover:bg-mint-600 text-white">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          ) : (
            <>
              {/* Authenticated Navigation */}
              {!isPublicRoute && (
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
              )}
              
              {/* If we're on the home page or public route and the user is authenticated, show Dashboard/Logout */}
              {isPublicRoute && (
                <>
                  <Link to="/dashboard" className="text-mint-700 hover:text-mint-900 font-medium">Dashboard</Link>
                  <Button variant="outline" onClick={handleLogout} className="border-mint-200 hover:bg-mint-50 text-mint-700">
                    Logout
                  </Button>
                </>
              )}
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
                  {/* Public Navigation Links - Mobile */}
                  <Link to="/about" className="text-mint-700 hover:text-mint-900">About</Link>
                  <Link to="/blog" className="text-mint-700 hover:text-mint-900">Blog</Link>
                  <Link to="/features" className="text-mint-700 hover:text-mint-900">Features</Link>
                  <Link to="/pricing" className="text-mint-700 hover:text-mint-900">Pricing</Link>
                  <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-gray-100">
                    <Link to="/login" className="text-mint-700 hover:text-mint-900 font-medium">Login</Link>
                    <Button asChild className="bg-mint-500 hover:bg-mint-600 text-white w-full">
                      <Link to="/signup">Sign Up</Link>
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Public Navigation Links - Mobile - Only on public routes when authenticated */}
                  {isPublicRoute && (
                    <>
                      <Link to="/about" className="text-mint-700 hover:text-mint-900">About</Link>
                      <Link to="/blog" className="text-mint-700 hover:text-mint-900">Blog</Link>
                      <Link to="/features" className="text-mint-700 hover:text-mint-900">Features</Link>
                      <Link to="/pricing" className="text-mint-700 hover:text-mint-900">Pricing</Link>
                      <Link to="/dashboard" className="text-mint-700 hover:text-mint-900 font-medium">Dashboard</Link>
                    </>
                  )}
                  
                  {/* Authenticated Navigation - Mobile - Only on non-public routes */}
                  {!isPublicRoute && (
                    <>
                      <Link to="/settings" className="text-mint-700 hover:text-mint-900">Settings</Link>
                      {isAdmin && (
                        <>
                          <div className="font-medium text-sm text-muted-foreground pt-2">Admin</div>
                          <Link to="/admin/users" className="text-mint-700 hover:text-mint-900 pl-2">Users</Link>
                          <Link to="/admin/flashcards" className="text-mint-700 hover:text-mint-900 pl-2">Flashcards</Link>
                          <Link to="/admin/sections" className="text-mint-700 hover:text-mint-900 pl-2">Sections</Link>
                          <Link to="/admin/grades" className="text-mint-700 hover:text-mint-900 pl-2">Grades</Link>
                          <Link to="/admin/csv-import" className="text-mint-700 hover:text-mint-900 pl-2">CSV Import</Link>
                          <Link to="/admin/features" className="text-mint-700 hover:text-mint-900 pl-2">Feature Management</Link>
                        </>
                      )}
                      {/* DND Toggle for mobile */}
                      <div className="flex items-center justify-between py-2">
                        <span>Do Not Disturb Mode</span>
                        <DndToggle />
                      </div>
                    </>
                  )}
                  
                  {/* Logout button always visible on mobile when logged in */}
                  <Button variant="outline" onClick={handleLogout} className="border-mint-200 hover:bg-mint-50 text-mint-700 mt-2">
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
