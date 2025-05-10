
import { useLocation } from "react-router-dom";
import { NavLink } from "./NavLink";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Separator } from "@/components/ui/separator";
import { useFeature } from "@/contexts/FeatureContext";

// Import all icons we need
import {
  Activity,
  BookOpen,
  Calendar,
  Clock,
  FileText,
  LayoutDashboard,
  ListTodo,
  MessageSquare,
  Settings,
  Target,
  Users,
} from "lucide-react";

interface NavigationProps {
  isCollapsed: boolean;
}

export const Navigation = ({ isCollapsed }: NavigationProps) => {
  const { pathname } = useLocation();
  const { userProfile } = useRequireAuth();
  
  // Check feature availability
  const isChatEnabled = useFeature("chat");
  const isCollaborationEnabled = useFeature("collaboration");
  
  return (
    <motion.ul variants={staggerVariants} className="flex h-full flex-col">
      <div className="flex grow flex-col items-center">
        <div className="flex h-full w-full flex-col">
          <div className="flex grow flex-col gap-4">
            <ScrollArea className="h-16 grow p-2">
              <div className={cn("flex w-full flex-col gap-1")}>
                {/* Main Section - replaced header with separator */}
                <Separator className="my-2" />
                <NavLink
                  to="/dashboard"
                  icon={LayoutDashboard}
                  label="Dashboard"
                  isActive={pathname === "/dashboard"}
                  isCollapsed={isCollapsed}
                />

                {/* Study Tools Section - replaced header with separator */}
                <Separator className="my-2" />
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

                {/* Planning Section - replaced header with separator */}
                <Separator className="my-2" />
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

                {/* Progress Section - replaced header with separator */}
                <Separator className="my-2" />
                <NavLink
                  to="/progress"
                  icon={Activity}
                  label="Progress"
                  isActive={pathname.includes("/progress")}
                  isCollapsed={isCollapsed}
                />

                {/* Communication Section - replaced header with separator, conditional rendering */}
                <Separator className="my-2" />
                {isChatEnabled && (
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
                )}
                {isCollaborationEnabled && (
                  <NavLink
                    to="/collaborate"
                    icon={Users}
                    label="Collaboration"
                    isActive={pathname.includes("/collaborate")}
                    isCollapsed={isCollapsed}
                  />
                )}
                
                {/* Settings - with separator */}
                <Separator className="my-2" />
                <NavLink
                  to="/settings"
                  icon={Settings}
                  label="Settings"
                  isActive={pathname.includes("/settings")}
                  isCollapsed={isCollapsed}
                />

                {/* Admin section - only for DEAN users */}
                {userProfile?.user_tier === UserTier.DEAN && (
                  <>
                    <Separator className="my-2" />
                    <NavLink
                      to="/admin/features"
                      icon={Settings}
                      label="Feature Management"
                      isActive={pathname.includes("/admin/features")}
                      isCollapsed={isCollapsed}
                    />
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </motion.ul>
  );
};
