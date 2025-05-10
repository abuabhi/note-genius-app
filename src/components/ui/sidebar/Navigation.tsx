
import { useLocation } from "react-router-dom";
import { NavSection } from "./NavSection";
import { NavLink } from "./NavLink";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";

// Import all icons we need
import {
  Activity,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  GraduationCap,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Settings,
  Target,
  Upload,
  User,
  Users,
} from "lucide-react";

interface NavigationProps {
  isCollapsed: boolean;
}

export const Navigation = ({ isCollapsed }: NavigationProps) => {
  const { pathname } = useLocation();
  const { userProfile } = useRequireAuth();
  const isAdmin = userProfile?.user_tier === UserTier.DEAN;
  
  return (
    <motion.ul variants={staggerVariants} className="flex h-full flex-col">
      <div className="flex grow flex-col items-center">
        <div className="flex h-full w-full flex-col">
          <div className="flex grow flex-col gap-4">
            <ScrollArea className="h-16 grow p-2">
              <div className={cn("flex w-full flex-col gap-1")}>
                {/* Main Section */}
                <NavSection title="Main">
                  <NavLink
                    to="/dashboard"
                    icon={LayoutDashboard}
                    label="Dashboard"
                    isActive={pathname === "/dashboard"}
                    isCollapsed={isCollapsed}
                  />
                </NavSection>

                {/* Study Tools Section */}
                <NavSection title="Study Tools">
                  <NavLink
                    to="/notes"
                    icon={FileText}
                    label="Notes"
                    isActive={pathname.includes("/notes")}
                    isCollapsed={isCollapsed}
                  />
                  <NavLink
                    to="/flashcards"
                    icon={BookOpen}
                    label="Flashcards"
                    isActive={pathname.includes("/flashcards")}
                    isCollapsed={isCollapsed}
                  />
                  <NavLink
                    to="/study-sessions"
                    icon={Clock}
                    label="Study Sessions"
                    isActive={pathname.includes("/study-sessions")}
                    isCollapsed={isCollapsed}
                  />
                  <NavLink
                    to="/quizzes"
                    icon={Activity}
                    label="Quizzes"
                    isActive={pathname.includes("/quizzes")}
                    isCollapsed={isCollapsed}
                  />
                </NavSection>

                {/* Planning Section */}
                <NavSection title="Planning">
                  <NavLink
                    to="/schedule"
                    icon={Calendar}
                    label="Schedule"
                    isActive={pathname.includes("/schedule")}
                    isCollapsed={isCollapsed}
                  />
                  <NavLink
                    to="/goals"
                    icon={Target}
                    label="Goals"
                    isActive={pathname.includes("/goals")}
                    isCollapsed={isCollapsed}
                  />
                  <NavLink
                    to="/todos"
                    icon={ListTodo}
                    label="Todos"
                    isActive={pathname.includes("/todos")}
                    isCollapsed={isCollapsed}
                  />
                </NavSection>

                {/* Progress Section */}
                <NavSection title="Progress">
                  <NavLink
                    to="/progress"
                    icon={Activity}
                    label="Progress"
                    isActive={pathname.includes("/progress")}
                    isCollapsed={isCollapsed}
                  />
                </NavSection>

                {/* Communication Section */}
                <NavSection title="Communication">
                  <NavLink
                    to="/chat"
                    icon={MessageSquare}
                    label="Chat"
                    isActive={pathname.includes("/chat")}
                    isCollapsed={isCollapsed}
                    badge={
                      <Badge
                        className={cn(
                          "flex h-fit w-fit items-center gap-1.5 rounded border-none bg-mint-50 px-1.5 text-mint-600 dark:bg-mint-700 dark:text-mint-300",
                        )}
                        variant="outline"
                      >
                        BETA
                      </Badge>
                    }
                  />
                  <NavLink
                    to="/collaborate"
                    icon={Users}
                    label="Collaboration"
                    isActive={pathname.includes("/collaborate")}
                    isCollapsed={isCollapsed}
                  />
                </NavSection>
                
                {/* Admin Section - Only visible to admin users */}
                {isAdmin && (
                  <NavSection title="Admin">
                    <NavLink
                      to="/admin/users"
                      icon={User}
                      label="Users"
                      isActive={pathname.includes("/admin/users")}
                      isCollapsed={isCollapsed}
                    />
                    <NavLink
                      to="/admin/flashcards"
                      icon={FileText}
                      label="Flashcards"
                      isActive={pathname.includes("/admin/flashcards")}
                      isCollapsed={isCollapsed}
                    />
                    <NavLink
                      to="/admin/sections"
                      icon={GraduationCap}
                      label="Sections"
                      isActive={pathname.includes("/admin/sections")}
                      isCollapsed={isCollapsed}
                    />
                    <NavLink
                      to="/admin/csv-import"
                      icon={Upload}
                      label="CSV Import"
                      isActive={pathname.includes("/admin/csv-import")}
                      isCollapsed={isCollapsed}
                    />
                  </NavSection>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </motion.ul>
  );
};
