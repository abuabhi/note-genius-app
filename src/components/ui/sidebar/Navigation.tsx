
import { useLocation } from "react-router-dom";
import { NavLink } from "./NavLink";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Separator } from "@/components/ui/separator";
import { useFeatures } from "@/contexts/FeatureContext";

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
  Target,
  Users,
  UserCheck,
} from "lucide-react";

interface NavigationProps {
  isCollapsed: boolean;
}

export const Navigation = ({ isCollapsed }: NavigationProps) => {
  const { pathname } = useLocation();
  const { userProfile } = useRequireAuth();
  const { isFeatureEnabled, isFeatureVisible } = useFeatures();
  
  // Define feature keys for standard app features
  const FEATURE_KEYS = {
    CHAT: "chat",
    COLLABORATION: "collaboration",
    CONNECTIONS: "connections",
    STUDY_SESSIONS: "study_sessions",
    TODOS: "todos",
    PROGRESS: "progress",
    GOALS: "goals", 
    SCHEDULE: "schedule",
    QUIZZES: "quizzes"
  };
  
  // Determine if specific features are visible
  const isChatVisible = isFeatureVisible(FEATURE_KEYS.CHAT);
  const isCollaborationVisible = isFeatureVisible(FEATURE_KEYS.COLLABORATION);
  const isConnectionsVisible = isFeatureVisible(FEATURE_KEYS.CONNECTIONS);
  const isStudySessionsVisible = isFeatureVisible(FEATURE_KEYS.STUDY_SESSIONS);
  const isTodosVisible = isFeatureVisible(FEATURE_KEYS.TODOS);
  const isProgressVisible = isFeatureVisible(FEATURE_KEYS.PROGRESS);
  const isGoalsVisible = isFeatureVisible(FEATURE_KEYS.GOALS);
  const isScheduleVisible = isFeatureVisible(FEATURE_KEYS.SCHEDULE);
  const isQuizzesVisible = isFeatureVisible(FEATURE_KEYS.QUIZZES);
  
  // Function to check if any items in a section are visible
  const isAnyCommunicationItemVisible = isChatVisible || isCollaborationVisible || isConnectionsVisible;
  const isAnyStudyItemVisible = isStudySessionsVisible || isQuizzesVisible;
  const isAnyPlanningItemVisible = isScheduleVisible || isGoalsVisible || isTodosVisible;
  
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

                {/* Study Tools Section - only show separator if any items are visible */}
                {(isAnyStudyItemVisible) && <Separator className="my-2" />}
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
                {isStudySessionsVisible && (
                  <NavLink
                    to="/study-sessions"
                    icon={Clock}
                    label="Study Sessions"
                    isActive={pathname.includes("/study-sessions")}
                    isCollapsed={isCollapsed}
                  />
                )}
                {isQuizzesVisible && (
                  <NavLink
                    to="/quizzes"
                    icon={Activity}
                    label="Quizzes"
                    isActive={pathname.includes("/quizzes")}
                    isCollapsed={isCollapsed}
                  />
                )}

                {/* Planning Section - only show if any planning items are visible */}
                {isAnyPlanningItemVisible && <Separator className="my-2" />}
                {isScheduleVisible && (
                  <NavLink
                    to="/schedule"
                    icon={Calendar}
                    label="Schedule"
                    isActive={pathname.includes("/schedule")}
                    isCollapsed={isCollapsed}
                  />
                )}
                {isGoalsVisible && (
                  <NavLink
                    to="/goals"
                    icon={Target}
                    label="Goals"
                    isActive={pathname.includes("/goals")}
                    isCollapsed={isCollapsed}
                  />
                )}
                {isTodosVisible && (
                  <NavLink
                    to="/todos"
                    icon={ListTodo}
                    label="Todos"
                    isActive={pathname.includes("/todos")}
                    isCollapsed={isCollapsed}
                  />
                )}

                {/* Progress Section - only show if visible */}
                {isProgressVisible && (
                  <>
                    <Separator className="my-2" />
                    <NavLink
                      to="/progress"
                      icon={Activity}
                      label="Progress"
                      isActive={pathname.includes("/progress")}
                      isCollapsed={isCollapsed}
                    />
                  </>
                )}

                {/* Communication Section - only show if any comm items are visible */}
                {isAnyCommunicationItemVisible && <Separator className="my-2" />}
                {isChatVisible && (
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
                {isCollaborationVisible && (
                  <NavLink
                    to="/collaboration"
                    icon={Users}
                    label="Collaboration"
                    isActive={pathname.includes("/collaboration")}
                    isCollapsed={isCollapsed}
                  />
                )}
                {isConnectionsVisible && (
                  <NavLink
                    to="/connections"
                    icon={UserCheck}
                    label="Connections"
                    isActive={pathname.includes("/connections")}
                    isCollapsed={isCollapsed}
                  />
                )}
                
                {/* Removed the Settings link from here as it's already in the user profile dropdown */}
                {/* This removes the duplicate settings link */}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </motion.ul>
  );
};
