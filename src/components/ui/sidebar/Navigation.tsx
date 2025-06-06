
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Separator } from "@/components/ui/separator";
import { useNavigationFeatures } from "./hooks/useNavigationFeatures";
import { NavLink } from "./NavLink";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Activity, 
  Target, 
  CheckSquare, 
  BarChart3, 
  Clock,
  Gift,
  Users,
  MessageSquare,
  Settings,
  Calendar,
  Bell
} from "lucide-react";

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
            <ScrollArea className="h-full grow p-2">
              <div className={cn("flex w-full flex-col gap-1")}>
                {/* Main Navigation */}
                <NavLink
                  to="/dashboard"
                  icon={LayoutDashboard}
                  label="Dashboard"
                  isActive={pathname === "/dashboard"}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                <NavLink
                  to="/notes"
                  icon={FileText}
                  label="Notes"
                  isActive={pathname.includes("/notes")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                <NavLink
                  to="/flashcards"
                  icon={BookOpen}
                  label="Flashcards"
                  isActive={pathname.includes("/flashcards")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                <NavLink
                  to="/quizzes"
                  icon={Activity}
                  label="Quiz"
                  isActive={pathname.includes("/quiz")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Study Tools */}
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
                
                <NavLink
                  to="/progress"
                  icon={BarChart3}
                  label="Progress"
                  isActive={pathname.includes("/progress")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                <NavLink
                  to="/schedule"
                  icon={Calendar}
                  label="Schedule"
                  isActive={pathname.includes("/schedule")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                <NavLink
                  to="/reminders"
                  icon={Bell}
                  label="Reminders"
                  isActive={pathname.includes("/reminders")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Rewards Section */}
                <NavLink
                  to="/referrals"
                  icon={Gift}
                  label="Refer & Win"
                  isActive={pathname.includes("/referrals")}
                  isCollapsed={isCollapsed}
                  badge={
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs animate-pulse ml-2"
                    >
                      NEW
                    </Badge>
                  }
                />
                <Separator className="my-2" />
                
                {/* Social Features */}
                <NavLink
                  to="/collaboration"
                  icon={Users}
                  label="Study Groups"
                  isActive={pathname.includes("/collaboration")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                <NavLink
                  to="/chat"
                  icon={MessageSquare}
                  label="Messages"
                  isActive={pathname.includes("/chat")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Additional Features */}
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
                
                {isStudySessionsVisible && (
                  <>
                    <NavLink
                      to="/study-sessions"
                      icon={Clock}
                      label="Study Sessions"
                      isActive={pathname.includes("/study-sessions")}
                      isCollapsed={isCollapsed}
                    />
                    <Separator className="my-2" />
                  </>
                )}
                
                {/* Settings */}
                <NavLink
                  to="/settings"
                  icon={Settings}
                  label="Settings"
                  isActive={pathname.includes("/settings")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </motion.ul>
  );
};
