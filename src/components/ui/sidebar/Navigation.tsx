
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { NavLink } from "./NavLink";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  LayoutDashboard, 
  FileText, 
  BookOpen, 
  Activity, 
  Target, 
  CheckSquare, 
  BarChart3,
  Gift,
  Heart,
  Calendar,
  HelpCircle,
  Settings
} from "lucide-react";

interface NavigationProps {
  isCollapsed: boolean;
}

export const Navigation = ({ isCollapsed }: NavigationProps) => {
  const { userProfile } = useRequireAuth();
  const { pathname } = useLocation();
  
  return (
    <motion.div 
      variants={staggerVariants} 
      className="flex h-full flex-col bg-gradient-to-b from-white to-mint-50/30"
    >
      <div className="flex grow flex-col">
        <ScrollArea className="flex-1 px-3 py-4">
          <div className={cn("flex w-full flex-col gap-1")}>
            
            {/* Core Section */}
            <div className="mb-3">
              {!isCollapsed && (
                <div className="px-3 py-2 mb-2">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Core</h2>
                </div>
              )}
              
              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  icon={LayoutDashboard}
                  label="Dashboard"
                  isActive={pathname === "/dashboard"}
                  isCollapsed={isCollapsed}
                />
                
                <NavLink
                  to="/notes"
                  icon={FileText}
                  label="Notes"
                  isActive={pathname.startsWith("/notes")}
                  isCollapsed={isCollapsed}
                />
                
                <NavLink
                  to="/flashcards"
                  icon={BookOpen}
                  label="Flashcards"
                  isActive={pathname.startsWith("/flashcards") || pathname.startsWith("/study")}
                  isCollapsed={isCollapsed}
                />
                
                <NavLink
                  to="/quizzes"
                  icon={Activity}
                  label="Quiz"
                  isActive={pathname.startsWith("/quiz")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>

            {/* Study Tools Section */}
            <div className="mb-3">
              {!isCollapsed && <Separator className="mb-3" />}
              {!isCollapsed && (
                <div className="px-3 py-2 mb-2">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Study Tools</h2>
                </div>
              )}
              
              <div className="space-y-1">
                <NavLink
                  to="/study-planner"
                  icon={Calendar}
                  label="Study Planner"
                  isActive={pathname.startsWith("/study-planner")}
                  isCollapsed={isCollapsed}
                />
                
                <NavLink
                  to="/goals"
                  icon={Target}
                  label="Goals"
                  isActive={pathname.startsWith("/goals")}
                  isCollapsed={isCollapsed}
                />
                
                <NavLink
                  to="/todos"
                  icon={CheckSquare}
                  label="ToDo"
                  isActive={pathname.startsWith("/todos")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>

            {/* Progress Section */}
            <div className="mb-3">
              {!isCollapsed && <Separator className="mb-3" />}
              {!isCollapsed && (
                <div className="px-3 py-2 mb-2">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Progress</h2>
                </div>
              )}
              
              <div className="space-y-1">
                <NavLink
                  to="/analytics"
                  icon={BarChart3}
                  label="Analytics"
                  isActive={pathname.startsWith("/analytics") || pathname.startsWith("/progress") || pathname.startsWith("/study-sessions")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>

            {/* Community Section */}
            <div className="mb-3">
              {!isCollapsed && <Separator className="mb-3" />}
              {!isCollapsed && (
                <div className="px-3 py-2 mb-2">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Community</h2>
                </div>
              )}
              
              <div className="space-y-1">
                <NavLink
                  to="/feedback"
                  icon={Heart}
                  label="Feedback"
                  isActive={pathname.startsWith("/feedback")}
                  isCollapsed={isCollapsed}
                  badge={
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-mint-400 to-mint-500 text-white text-xs px-2 py-0.5 font-medium shadow-sm animate-pulse hover:animate-none"
                    >
                      NEW
                    </Badge>
                  }
                />
                
                <NavLink
                  to="/referrals"
                  icon={Gift}
                  label="Refer & Win"
                  isActive={pathname.startsWith("/referrals")}
                  isCollapsed={isCollapsed}
                  badge={
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 font-medium shadow-sm animate-bounce"
                    >
                      WIN
                    </Badge>
                  }
                />
              </div>
            </div>

            {/* Support Section */}
            <div>
              {!isCollapsed && <Separator className="mb-3" />}
              {!isCollapsed && (
                <div className="px-3 py-2 mb-2">
                  <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Support</h2>
                </div>
              )}
              
              <div className="space-y-1">
                <NavLink
                  to="/help"
                  icon={HelpCircle}
                  label="Help"
                  isActive={pathname.startsWith("/help")}
                  isCollapsed={isCollapsed}
                />
                
                <NavLink
                  to="/settings"
                  icon={Settings}
                  label="Settings"
                  isActive={pathname.startsWith("/settings")}
                  isCollapsed={isCollapsed}
                />
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};
