
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Separator } from "@/components/ui/separator";
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
  Heart
} from "lucide-react";

interface NavigationProps {
  isCollapsed: boolean;
}

export const Navigation = ({ isCollapsed }: NavigationProps) => {
  const { userProfile } = useRequireAuth();
  const { pathname } = useLocation();
  
  return (
    <motion.ul variants={staggerVariants} className="flex h-full flex-col">
      <div className="flex grow flex-col items-center">
        <div className="flex h-full w-full flex-col">
          <div className="flex grow flex-col gap-4">
            <ScrollArea className="h-full grow p-2">
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
                
                {/* Quiz - now always visible */}
                <NavLink
                  to="/quizzes"
                  icon={Activity}
                  label="Quiz"
                  isActive={pathname.includes("/quiz")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Goals - now always visible */}
                <NavLink
                  to="/goals"
                  icon={Target}
                  label="Goals"
                  isActive={pathname.includes("/goals")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Progress */}
                <NavLink
                  to="/progress"
                  icon={BarChart3}
                  label="Progress"
                  isActive={pathname.includes("/progress")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Feedback */}
                <NavLink
                  to="/feedback"
                  icon={Heart}
                  label="Feedback"
                  isActive={pathname.includes("/feedback")}
                  isCollapsed={isCollapsed}
                  badge={
                    <Badge 
                      variant="secondary" 
                      className="bg-gradient-to-r from-orange-600 to-amber-700 text-white text-xs animate-bounce ml-2"
                    >
                      FEEDBACK
                    </Badge>
                  }
                  customClassName={cn(
                    "animate-pulse hover:animate-none",
                    pathname.includes("/feedback") 
                      ? "bg-gradient-to-r from-orange-500 to-amber-600 text-white shadow-lg" 
                      : "hover:bg-gradient-to-r hover:from-orange-50 hover:to-amber-50"
                  )}
                />
                <Separator className="my-2" />
                
                {/* Todo - now always visible */}
                <NavLink
                  to="/todos"
                  icon={CheckSquare}
                  label="ToDo"
                  isActive={pathname.includes("/todos")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Study Sessions - now always visible */}
                <NavLink
                  to="/study-sessions"
                  icon={Clock}
                  label="Study Sessions"
                  isActive={pathname.includes("/study-sessions")}
                  isCollapsed={isCollapsed}
                />
                <Separator className="my-2" />
                
                {/* Refer & Win */}
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
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </motion.ul>
  );
};
