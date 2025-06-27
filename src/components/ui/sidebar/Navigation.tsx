
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth } from "@/hooks/useRequireAuth";
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
  Gift,
  Heart,
  Calendar
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
      className="flex h-full flex-col bg-white/50 backdrop-blur-sm"
    >
      <div className="flex grow flex-col">
        <ScrollArea className="flex-1 px-3 py-4">
          <div className={cn("flex w-full flex-col gap-1")}>
            {/* Dashboard */}
            <NavLink
              to="/dashboard"
              icon={LayoutDashboard}
              label="Dashboard"
              isActive={pathname === "/dashboard"}
              isCollapsed={isCollapsed}
            />
            
            {/* Notes */}
            <NavLink
              to="/notes"
              icon={FileText}
              label="Notes"
              isActive={pathname.startsWith("/notes")}
              isCollapsed={isCollapsed}
            />
            
            {/* Flashcards */}
            <NavLink
              to="/flashcards"
              icon={BookOpen}
              label="Flashcards"
              isActive={pathname.startsWith("/flashcards") || pathname.startsWith("/study")}
              isCollapsed={isCollapsed}
            />
            
            {/* Quiz */}
            <NavLink
              to="/quizzes"
              icon={Activity}
              label="Quiz"
              isActive={pathname.startsWith("/quiz")}
              isCollapsed={isCollapsed}
            />
            
            {/* Goals */}
            <NavLink
              to="/goals"
              icon={Target}
              label="Goals"
              isActive={pathname.startsWith("/goals")}
              isCollapsed={isCollapsed}
            />
            
            {/* Study Planner */}
            <NavLink
              to="/study-planner"
              icon={Calendar}
              label="Study Planner"
              isActive={pathname.startsWith("/study-planner")}
              isCollapsed={isCollapsed}
            />
            
            {/* Todo */}
            <NavLink
              to="/todos"
              icon={CheckSquare}
              label="ToDo"
              isActive={pathname.startsWith("/todos")}
              isCollapsed={isCollapsed}
            />
            
            {/* Analytics */}
            <NavLink
              to="/analytics"
              icon={BarChart3}
              label="Analytics"
              isActive={pathname.startsWith("/analytics") || pathname.startsWith("/progress") || pathname.startsWith("/study-sessions")}
              isCollapsed={isCollapsed}
            />
            
            {/* Feedback */}
            <NavLink
              to="/feedback"
              icon={Heart}
              label="Feedback"
              isActive={pathname.startsWith("/feedback")}
              isCollapsed={isCollapsed}
              badge={
                <Badge 
                  variant="secondary" 
                  className="bg-mint-100 text-mint-700 text-xs ml-2 px-2 py-0.5"
                >
                  NEW
                </Badge>
              }
              customClassName={cn(
                "hover:bg-mint-50 transition-colors duration-200",
                pathname.startsWith("/feedback") 
                  ? "bg-mint-100 text-mint-700 font-medium border-r-2 border-mint-500" 
                  : "hover:bg-mint-50"
              )}
            />
            
            {/* Refer & Win */}
            <NavLink
              to="/referrals"
              icon={Gift}
              label="Refer & Win"
              isActive={pathname.startsWith("/referrals")}
              isCollapsed={isCollapsed}
              badge={
                <Badge 
                  variant="secondary" 
                  className="bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 text-xs ml-2 px-2 py-0.5"
                >
                  WIN
                </Badge>
              }
            />
          </div>
        </ScrollArea>
      </div>
    </motion.div>
  );
};
