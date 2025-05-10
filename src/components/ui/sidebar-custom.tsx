
"use client";

import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  BookOpen,
  Calendar,
  ChevronsUpDown,
  Clock,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  LogOut,
  MessageSquare,
  Settings,
  Shield,
  Target,
  User,
  Users,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";

const sidebarVariants = {
  open: {
    width: "15rem",
  },
  closed: {
    width: "3.05rem",
  },
};

const contentVariants = {
  open: { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const variants = {
  open: {
    x: 0,
    opacity: 1,
    transition: {
      x: { stiffness: 1000, velocity: -100 },
    },
  },
  closed: {
    x: -20,
    opacity: 0,
    transition: {
      x: { stiffness: 100 },
    },
  },
};

const transitionProps = {
  type: "tween",
  ease: "easeOut",
  duration: 0.2,
  staggerChildren: 0.1,
};

const staggerVariants = {
  open: {
    transition: { staggerChildren: 0.03, delayChildren: 0.02 },
  },
};

export function CustomSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const { user, userProfile } = useRequireAuth();
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;
  const location = useLocation();
  const pathname = location.pathname;
  
  return (
    <motion.div
      className={cn(
        "sidebar fixed left-0 z-40 h-full shrink-0 border-r"
      )}
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className={`relative z-40 flex text-muted-foreground h-full shrink-0 flex-col bg-white dark:bg-black transition-all`}
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex grow flex-col items-center">
            <div className="flex h-[54px] w-full shrink-0 border-b p-2">
              <div className="mt-[1.5px] flex w-full">
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger className="w-full" asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex w-fit items-center gap-2 px-2" 
                    >
                      <Avatar className='rounded size-4'>
                        <AvatarFallback>{user?.email?.charAt(0).toUpperCase() || "S"}</AvatarFallback>
                      </Avatar>
                      <motion.li
                        variants={variants}
                        className="flex w-fit items-center gap-2"
                      >
                        {!isCollapsed && (
                          <>
                            <p className="text-sm font-medium">
                              {userProfile?.username || "StudyApp"}
                            </p>
                            <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />
                          </>
                        )}
                      </motion.li>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem
                      asChild
                      className="flex items-center gap-2"
                    >
                      <Link to="/settings">
                        <Settings className="h-4 w-4" /> Settings
                      </Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem
                        asChild
                        className="flex items-center gap-2"
                      >
                        <Link to="/admin/users">
                          <Shield className="h-4 w-4" /> Admin Panel
                        </Link>
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex h-full w-full flex-col">
              <div className="flex grow flex-col gap-4">
                <ScrollArea className="h-16 grow p-2">
                  <div className={cn("flex w-full flex-col gap-1")}>
                    {/* Main Section */}
                    <div className="py-1">
                      <p className="px-2 text-xs font-medium text-muted-foreground mb-1">Main</p>
                      <Link
                        to="/dashboard"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname === "/dashboard" && "bg-muted text-mint-600",
                        )}
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Dashboard</p>
                          )}
                        </motion.li>
                      </Link>
                    </div>

                    {/* Study Tools Section */}
                    <div className="py-1">
                      <p className="px-2 text-xs font-medium text-muted-foreground mb-1">Study Tools</p>
                      <Link
                        to="/notes"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/notes") && "bg-muted text-mint-600",
                        )}
                      >
                        <FileText className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Notes</p>
                          )}
                        </motion.li>
                      </Link>
                      <Link
                        to="/flashcards"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/flashcards") && "bg-muted text-mint-600",
                        )}
                      >
                        <BookOpen className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Flashcards</p>
                          )}
                        </motion.li>
                      </Link>
                      <Link
                        to="/study-sessions"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/study-sessions") && "bg-muted text-mint-600",
                        )}
                      >
                        <Clock className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Study Sessions</p>
                          )}
                        </motion.li>
                      </Link>
                      <Link
                        to="/quizzes"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/quizzes") && "bg-muted text-mint-600",
                        )}
                      >
                        <Activity className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Quizzes</p>
                          )}
                        </motion.li>
                      </Link>
                    </div>

                    {/* Planning Section */}
                    <div className="py-1">
                      <p className="px-2 text-xs font-medium text-muted-foreground mb-1">Planning</p>
                      <Link
                        to="/schedule"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/schedule") && "bg-muted text-mint-600",
                        )}
                      >
                        <Calendar className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Schedule</p>
                          )}
                        </motion.li>
                      </Link>
                      <Link
                        to="/goals"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/goals") && "bg-muted text-mint-600",
                        )}
                      >
                        <Target className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Goals</p>
                          )}
                        </motion.li>
                      </Link>
                      <Link
                        to="/todos"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/todos") && "bg-muted text-mint-600",
                        )}
                      >
                        <ListTodo className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Todos</p>
                          )}
                        </motion.li>
                      </Link>
                    </div>

                    {/* Progress Section */}
                    <div className="py-1">
                      <p className="px-2 text-xs font-medium text-muted-foreground mb-1">Progress</p>
                      <Link
                        to="/progress"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/progress") && "bg-muted text-mint-600",
                        )}
                      >
                        <Activity className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Progress</p>
                          )}
                        </motion.li>
                      </Link>
                    </div>

                    {/* Communication Section */}
                    <div className="py-1">
                      <p className="px-2 text-xs font-medium text-muted-foreground mb-1">Communication</p>
                      <Link
                        to="/chat"
                        className={cn(
                          "flex h-8 flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/chat") && "bg-muted text-mint-600",
                        )}
                      >
                        <MessageSquare className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <div className="ml-2 flex items-center gap-2">
                              <p className="text-sm font-medium">Chat</p>
                              <Badge
                                className={cn(
                                  "flex h-fit w-fit items-center gap-1.5 rounded border-none bg-mint-50 px-1.5 text-mint-600 dark:bg-mint-700 dark:text-mint-300",
                                )}
                                variant="outline"
                              >
                                BETA
                              </Badge>
                            </div>
                          )}
                        </motion.li>
                      </Link>
                      <Link
                        to="/collaborate"
                        className={cn(
                          "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                          pathname?.includes("/collaborate") && "bg-muted text-mint-600",
                        )}
                      >
                        <Users className="h-4 w-4" />
                        <motion.li variants={variants}>
                          {!isCollapsed && (
                            <p className="ml-2 text-sm font-medium">Collaboration</p>
                          )}
                        </motion.li>
                      </Link>
                    </div>
                    
                    {/* Admin Section - Only visible to admin users */}
                    {isAdmin && (
                      <div className="py-1">
                        <p className="px-2 text-xs font-medium text-amber-500 mb-1">Admin</p>
                        <Link
                          to="/admin/users"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            pathname?.includes("/admin/users") && "bg-muted text-amber-600",
                          )}
                        >
                          <User className="h-4 w-4" />
                          <motion.li variants={variants}>
                            {!isCollapsed && (
                              <p className="ml-2 text-sm font-medium">Users</p>
                            )}
                          </motion.li>
                        </Link>
                        <Link
                          to="/admin/flashcards"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            pathname?.includes("/admin/flashcards") && "bg-muted text-amber-600",
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          <motion.li variants={variants}>
                            {!isCollapsed && (
                              <p className="ml-2 text-sm font-medium">Flashcards</p>
                            )}
                          </motion.li>
                        </Link>
                        <Link
                          to="/admin/sections"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            pathname?.includes("/admin/sections") && "bg-muted text-amber-600",
                          )}
                        >
                          <GraduationCap className="h-4 w-4" />
                          <motion.li variants={variants}>
                            {!isCollapsed && (
                              <p className="ml-2 text-sm font-medium">Sections</p>
                            )}
                          </motion.li>
                        </Link>
                        <Link
                          to="/admin/csv-import"
                          className={cn(
                            "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary",
                            pathname?.includes("/admin/csv-import") && "bg-muted text-amber-600",
                          )}
                        >
                          <FileText className="h-4 w-4" />
                          <motion.li variants={variants}>
                            {!isCollapsed && (
                              <p className="ml-2 text-sm font-medium">CSV Import</p>
                            )}
                          </motion.li>
                        </Link>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </div>
              <div className="flex flex-col p-2">
                <div>
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger className="w-full">
                      <div className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition hover:bg-muted hover:text-primary">
                        <LogOut className="h-4 w-4" />
                        <motion.li
                          variants={variants}
                          className="flex w-full items-center gap-2"
                        >
                          {!isCollapsed && (
                            <>
                              <p className="text-sm font-medium">Logout</p>
                              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground/50" />
                            </>
                          )}
                        </motion.li>
                      </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent sideOffset={5}>
                      <div className="flex flex-row items-center gap-2 p-2">
                        <Avatar className="size-6">
                          <AvatarFallback>
                            {user?.email?.charAt(0).toUpperCase() || "S"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col text-left">
                          <span className="text-sm font-medium">
                            {userProfile?.username || "User"}
                          </span>
                          <span className="line-clamp-1 text-xs text-muted-foreground">
                            {user?.email || "user@example.com"}
                          </span>
                        </div>
                      </div>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to log out?")) {
                            window.location.href = "/login";
                          }
                        }}
                      >
                        <LogOut className="h-4 w-4" /> Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}

export function SidebarDemo() {
  return (
    <div className="flex h-screen w-screen flex-row">
      <CustomSidebar />
      <main className="flex h-screen grow flex-col overflow-auto">
        {/* Content goes here */}
      </main>
    </div>
  );
}
