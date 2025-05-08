import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X } from "lucide-react";
import { ChatCircle, Calendar, Settings, ChartLineUp, Book, Rocket, BrainCircuit, FileText } from "lucide-react";

const NavigationLink = ({ to, children, icon }: { to: string; children: React.ReactNode; icon?: React.ReactNode }) => (
  <Link to={to} className="ml-8 hover:text-gray-500 flex items-center">
    {icon}
    {children}
  </Link>
);

const MobileNavLink = ({ to, children, onClick }: { to: string; children: React.ReactNode; onClick: () => void }) => (
  <Link to={to} onClick={onClick} className="block py-2 px-4 hover:bg-gray-100">
    {children}
  </Link>
);

const NavBar = () => {
  const { logOut, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = !!user;

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-background border-b shadow-sm">
      <div className="mx-auto px-4">
        <div className="flex justify-between h-16">
          {/* Logo and brand */}
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold">
              StudyTool.io <BrainCircuit className="inline-block w-6 h-6 ml-1" />
            </Link>
          </div>

          {/* Navigation links */}
          <div className="hidden md:flex items-center">
            {isAuthenticated && (
              <>
                <NavigationLink to="/dashboard" icon={<ChartLineUp className="mr-2 h-4 w-4" />}>
                  Dashboard
                </NavigationLink>
                <NavigationLink to="/notes" icon={<FileText className="mr-2 h-4 w-4" />}>
                  Notes
                </NavigationLink>
                <NavigationLink to="/flashcards" icon={<Rocket className="mr-2 h-4 w-4" />}>
                  Flashcards
                </NavigationLink>
                <NavigationLink to="/schedule" icon={<Calendar className="mr-2 h-4 w-4" />}>
                  Schedule
                </NavigationLink>
                <NavigationLink to="/settings" icon={<Settings className="mr-2 h-4 w-4" />}>
                  Settings
                </NavigationLink>
                <NavigationLink to="/library" icon={<Book className="mr-2 h-4 w-4" />}>
                  Library
                </NavigationLink>
                <NavigationLink to="/chat" icon={<ChatCircle className="mr-2 h-4 w-4" />}>
                  Chat
                </NavigationLink>
              </>
            )}
          </div>

          {/* Mobile menu */}
          <div className="md:hidden">
            <button onClick={toggleMobileMenu} className="flex items-center py-2 px-3 border rounded text-gray-500 border-gray-500 hover:text-gray-800 hover:border-gray-800">
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>

            {/* Mobile navigation */}
            {isMobileMenuOpen && (
              <div className="absolute top-16 left-0 right-0 bg-background border-b shadow-lg z-50">
                <div className="px-2 pt-2 pb-3 space-y-1">
                  {!isAuthenticated ? (
                    <>
                      <MobileNavLink to="/login" onClick={closeMobileMenu}>
                        Login
                      </MobileNavLink>
                      <MobileNavLink to="/signup" onClick={closeMobileMenu}>
                        Sign Up
                      </MobileNavLink>
                    </>
                  ) : (
                    <>
                      <MobileNavLink to="/dashboard" onClick={closeMobileMenu}>
                        <ChartLineUp className="mr-2 h-5 w-5" />
                        Dashboard
                      </MobileNavLink>
                      <MobileNavLink to="/notes" onClick={closeMobileMenu}>
                        <FileText className="mr-2 h-5 w-5" />
                        Notes
                      </MobileNavLink>
                      <MobileNavLink to="/flashcards" onClick={closeMobileMenu}>
                        <Rocket className="mr-2 h-5 w-5" />
                        Flashcards
                      </MobileNavLink>
                      <MobileNavLink to="/schedule" onClick={closeMobileMenu}>
                        <Calendar className="mr-2 h-5 w-5" />
                        Schedule
                      </MobileNavLink>
                      <MobileNavLink to="/settings" onClick={closeMobileMenu}>
                        <Settings className="mr-2 h-5 w-5" />
                        Settings
                      </MobileNavLink>
                      <MobileNavLink to="/library" onClick={closeMobileMenu}>
                        <Book className="mr-2 h-5 w-5" />
                        Library
                      </MobileNavLink>
                      <MobileNavLink to="/chat" onClick={closeMobileMenu}>
                        <ChatCircle className="mr-2 h-5 w-5" />
                        Chat
                      </MobileNavLink>
                      <button onClick={() => { logOut(); closeMobileMenu(); }} className="block py-2 px-4 hover:bg-gray-100 w-full text-left">
                        Log Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Auth links */}
          <div className="hidden md:flex items-center">
            {!isAuthenticated ? (
              <>
                <Link to="/login" className="ml-8 hover:text-gray-500">
                  Login
                </Link>
                <Link to="/signup" className="ml-8 hover:text-gray-500">
                  Sign Up
                </Link>
              </>
            ) : (
              <button onClick={logOut} className="ml-8 hover:text-gray-500">
                Log Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
