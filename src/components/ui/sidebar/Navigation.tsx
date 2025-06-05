
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Separator } from "@/components/ui/separator";
import { useNavigationFeatures } from "./hooks/useNavigationFeatures";
import { NavLink } from "./NavLink";
import { useLocation } from "react-router-dom";
import { LayoutDashboard, FileText, BookOpen, Activity, Target, CheckSquare, BarChart3, Clock } from "lucide-react";

interface NavigationProps {
  isCollapsed: boolean;
}

export const Navigation = ({ isCollapsed }: NavigationProps) => {
  const { userProfile } = useRequireAuth();
  const { pathname } = useLocation();
  const {
    isGoalsVisible,
    isTodosVisible,
    isProgressVisible,
    isStudySessionsVisible
  } = useNavigationFeatures();
  
  return (
    <motion.ul variants={staggerVariants} className="flex h-full flex-col">
      <div className="flex grow flex-col items-center">
        <div className="flex h-full w-full flex-col">
          <div className="flex grow flex-col gap-4">
            <ScrollArea className="h-16 grow p-2">
              <div className={cn("flex w-full flex-col gap-1")}>
                {/* Dashboard */}
                <NavLink
                  to="/dashboard"
                  icon={LayoutDashboard}
                  label="Dashboard"
                  isActive={pathname === "/dashboard"}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Notes */}
                <NavLink
                  to="/notes"
                  icon={FileText}
                  label="Notes"
                  isActive={pathname.includes("/notes")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Flashcards */}
                <NavLink
                  to="/flashcards"
                  icon={BookOpen}
                  label="Flashcards"
                  isActive={pathname.includes("/flashcards")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Quiz */}
                <NavLink
                  to="/quiz"
                  icon={Activity}
                  label="Quiz"
                  isActive={pathname.includes("/quiz")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Goals - only show if visible */}
                {isGoalsVisible && (
                  <>
                    <NavLink
                      to="/goals"
                      icon={Target}
                      label="Goals"
                      isActive={pathname.includes("/goals")}
                      isCollapsed={isCollapsed}
                    />
                    <Separator className="my-2" />
                  </>
                )}
                
                {/* ToDo - only show if visible */}
                {isTodosVisible && (
                  <>
                    <NavLink
                      to="/todos"
                      icon={CheckSquare}
                      label="ToDo"
                      isActive={pathname.includes("/todos")}
                      isCollapsed={isCollapsed}
                    />
                    <Separator className="my-2" />
                  </>
                )}
                
                {/* Progress - only show if visible */}
                {isProgressVisible && (
                  <>
                    <NavLink
                      to="/progress"
                      icon={BarChart3}
                      label="Progress"
                      isActive={pathname.includes("/progress")}
                      isCollapsed={isCollapsed}
                    />
                    <Separator className="my-2" />
                  </>
                )}
                
                {/* Study Sessions - only show if visible */}
                {isStudySessionsVisible && (
                  <NavLink
                    to="/study-sessions"
                    icon={Clock}
                    label="Study Sessions"
                    isActive={pathname.includes("/study-sessions")}
                    isCollapsed={isCollapsed}
                  />
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </motion.ul>
  );
};
