
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import useMediaQuery from "@/hooks/useMediaQuery";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import {
  Menu,
  LogOut,
  UserCircle,
  BookOpen,
  BarChart,
  CalendarDays,
  Settings,
  Library,
  MessageSquare,
  Target
} from "lucide-react";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { cn } from "@/lib/utils";
import { DndToggle } from "../dnd/DndToggle";

export default function NavBar() {
  const { user, signOut } = useAuth();
  const { userProfile, tierLimits } = useRequireAuth();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [isClient, setIsClient] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  
  // Determine if chat is enabled for this user's tier
  const chatEnabled = tierLimits?.chat_enabled || false;

  const navLinks = [
    { name: "Dashboard", path: "/dashboard", icon: <BookOpen className="mr-2 h-4 w-4" /> },
    { name: "Notes", path: "/notes", icon: <BookOpen className="mr-2 h-4 w-4" /> },
    { name: "Flashcards", path: "/flashcards", icon: <BookOpen className="mr-2 h-4 w-4" /> },
    { name: "Study", path: "/study", icon: <BookOpen className="mr-2 h-4 w-4" /> },
    { name: "Sessions", path: "/study-sessions", icon: <BarChart className="mr-2 h-4 w-4" /> },
    { name: "Schedule", path: "/schedule", icon: <CalendarDays className="mr-2 h-4 w-4" /> },
    { name: "Goals", path: "/goals", icon: <Target className="mr-2 h-4 w-4" /> },
    { name: "Progress", path: "/progress", icon: <BarChart className="mr-2 h-4 w-4" /> },
    { name: "Library", path: "/library", icon: <Library className="mr-2 h-4 w-4" /> },
    ...(chatEnabled ? [{ name: "Chat", path: "/chat", icon: <MessageSquare className="mr-2 h-4 w-4" /> }] : []),
  ];

  const renderMobile = () => {
    return (
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[300px] sm:w-[400px]">
          <nav className="flex flex-col gap-4 mt-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 p-2">
                  <Avatar>
                    <AvatarImage src={userProfile?.avatar_url || ""} />
                    <AvatarFallback>
                      {user.email?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {userProfile?.username || user.email}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {userProfile?.user_tier || "SCHOLAR"}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  {navLinks.map((link) => (
                    <Button
                      key={link.path}
                      asChild
                      variant={isActive(link.path) ? "secondary" : "ghost"}
                      className="w-full justify-start"
                    >
                      <Link to={link.path}>
                        {link.icon}
                        {link.name}
                      </Link>
                    </Button>
                  ))}
                </div>

                <div className="space-y-1 pt-4">
                  <Button
                    asChild
                    variant={isActive("/settings") ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    <Link to="/settings">
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </Link>
                  </Button>

                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <Button asChild className="w-full">
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </nav>
        </SheetContent>
      </Sheet>
    );
  };

  const renderDesktop = () => {
    return (
      <NavigationMenu className="hidden md:flex">
        <NavigationMenuList>
          {user && (
            <>
              <NavigationMenuItem>
                <Link to="/dashboard">
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    active={isActive("/dashboard")}
                  >
                    Dashboard
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn({
                    "bg-accent text-accent-foreground": [
                      "/notes",
                      "/flashcards",
                    ].includes(location.pathname),
                  })}
                >
                  Study Materials
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/notes"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            {
                              "bg-accent text-accent-foreground":
                                isActive("/notes"),
                            }
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Notes
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Create and manage your study notes
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/flashcards"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            {
                              "bg-accent text-accent-foreground":
                                isActive("/flashcards"),
                            }
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Flashcards
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Create and study with flashcards
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/library"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            {
                              "bg-accent text-accent-foreground":
                                isActive("/library"),
                            }
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Library
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Browse the flashcard library
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger
                  className={cn({
                    "bg-accent text-accent-foreground": [
                      "/study",
                      "/study-sessions",
                      "/progress",
                      "/schedule",
                      "/goals"
                    ].includes(location.pathname),
                  })}
                >
                  Study Sessions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/study"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            {
                              "bg-accent text-accent-foreground":
                                isActive("/study"),
                            }
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Study Now
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Start a new study session
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/study-sessions"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            {
                              "bg-accent text-accent-foreground":
                                isActive("/study-sessions"),
                            }
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Session History
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            View your study session history
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/schedule"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            {
                              "bg-accent text-accent-foreground":
                                isActive("/schedule"),
                            }
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Schedule
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Plan your study sessions
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/goals"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            {
                              "bg-accent text-accent-foreground":
                                isActive("/goals"),
                            }
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Goals
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Set and track study goals
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <li>
                      <NavigationMenuLink asChild>
                        <Link
                          to="/progress"
                          className={cn(
                            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
                            {
                              "bg-accent text-accent-foreground":
                                isActive("/progress"),
                            }
                          )}
                        >
                          <div className="text-sm font-medium leading-none">
                            Progress
                          </div>
                          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                            Track your study progress
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {chatEnabled && (
                <NavigationMenuItem>
                  <Link to="/chat">
                    <NavigationMenuLink
                      className={navigationMenuTriggerStyle()}
                      active={isActive("/chat")}
                    >
                      Chat
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              )}
            </>
          )}

          {!user && (
            <>
              <NavigationMenuItem>
                <Link to="/about">
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    active={isActive("/about")}
                  >
                    About
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/pricing">
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    active={isActive("/pricing")}
                  >
                    Pricing
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/faq">
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    active={isActive("/faq")}
                  >
                    FAQ
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link to="/contact">
                  <NavigationMenuLink
                    className={navigationMenuTriggerStyle()}
                    active={isActive("/contact")}
                  >
                    Contact
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </>
          )}
        </NavigationMenuList>
      </NavigationMenu>
    );
  };

  if (!isClient) {
    // SSR / initial render
    return null;
  }

  // Determine if admin
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold">Study App</span>
          </Link>
        </div>

        {/* Mobile burger menu */}
        {isMobile ? renderMobile() : null}

        {/* Desktop navigation */}
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {!isMobile ? renderDesktop() : null}
          </div>

          {/* Do Not Disturb toggle */}
          {user && <DndToggle />}

          {/* User menu */}
          <div className="flex items-center">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-9 w-9 rounded-full"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={userProfile?.avatar_url || ""} />
                      <AvatarFallback>
                        {user.email?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userProfile?.username || user.email}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link to="/settings">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin/users">
                            <UserCircle className="mr-2 h-4 w-4" />
                            <span>Admin</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault();
                      handleSignOut();
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
