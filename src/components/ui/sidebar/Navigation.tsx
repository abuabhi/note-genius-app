
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { NavLink } from "./NavLink";
import { useLocation } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { TierDropdown } from "./TierDropdown";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Activity,
  Target,
  Bookmark,
  BarChart3,
  Gift,
  Heart,
  Calendar,
  HelpCircle,
  GraduationCap,
} from "lucide-react";

interface NavigationProps {
  isCollapsed: boolean;
}

interface NavGroupProps {
  label: string;
  isCollapsed: boolean;
  children: React.ReactNode;
  withSeparator?: boolean;
}

const NavGroup = ({ label, isCollapsed, children, withSeparator }: NavGroupProps) => (
  <div className="mb-3">
    {!isCollapsed && withSeparator && <Separator className="mb-3" />}
    {!isCollapsed && (
      <div className="px-3 py-2 mb-2">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </h2>
      </div>
    )}
    <div className="space-y-1">{children}</div>
  </div>
);

export const Navigation = ({ isCollapsed }: NavigationProps) => {
  useRequireAuth();
  const { pathname } = useLocation();

  return (
    <motion.div
      variants={staggerVariants}
      className="flex h-full flex-col bg-gradient-to-b from-white to-mint-50/30"
    >
      <div className="flex grow flex-col">
        <ScrollArea className="flex-1 px-3 py-4">
          <div className={cn("flex w-full flex-col gap-1")}>
            {/* Dashboard always on top, ungrouped */}
            <div className="mb-3">
              <NavLink
                to="/dashboard"
                icon={LayoutDashboard}
                label="Dashboard"
                isActive={pathname === "/dashboard"}
                isCollapsed={isCollapsed}
              />
            </div>

            {/* STUDY — the core learning loop */}
            <NavGroup label="Study" isCollapsed={isCollapsed} withSeparator>
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
            </NavGroup>

            {/* PLAN — scheduling, goals, tasks */}
            <NavGroup label="Plan" isCollapsed={isCollapsed} withSeparator>
              <NavLink
                to="/schedule"
                icon={Calendar}
                label="Schedule"
                isActive={
                  pathname.startsWith("/schedule") ||
                  pathname.startsWith("/study-planner") ||
                  pathname.startsWith("/reminders")
                }
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/goals"
                icon={Target}
                label="Study Goals"
                isActive={pathname.startsWith("/goals") || pathname.startsWith("/todos")}
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/exam-prep"
                icon={GraduationCap}
                label="Exam Prep"
                isActive={pathname.startsWith("/exam-prep")}
                isCollapsed={isCollapsed}
              />
            </NavGroup>

            {/* INSIGHT — analytics & resources */}
            <NavGroup label="Insight" isCollapsed={isCollapsed} withSeparator>
              <NavLink
                to="/analytics"
                icon={BarChart3}
                label="Analytics"
                isActive={
                  pathname.startsWith("/analytics") ||
                  pathname.startsWith("/progress") ||
                  pathname.startsWith("/study-sessions")
                }
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/resources"
                icon={Bookmark}
                label="Resources"
                isActive={pathname.startsWith("/resources")}
                isCollapsed={isCollapsed}
              />
            </NavGroup>

            {/* MORE — secondary, low-frequency items */}
            <NavGroup label="More" isCollapsed={isCollapsed} withSeparator>
              <NavLink
                to="/referrals"
                icon={Gift}
                label="Refer & Win"
                isActive={pathname.startsWith("/referrals")}
                isCollapsed={isCollapsed}
                badge={
                  <Badge
                    variant="secondary"
                    className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-0.5 font-medium shadow-sm"
                  >
                    WIN
                  </Badge>
                }
              />
              <NavLink
                to="/feedback"
                icon={Heart}
                label="Feedback"
                isActive={pathname.startsWith("/feedback")}
                isCollapsed={isCollapsed}
              />
              <NavLink
                to="/help"
                icon={HelpCircle}
                label="Help"
                isActive={pathname.startsWith("/help")}
                isCollapsed={isCollapsed}
              />
            </NavGroup>
          </div>
        </ScrollArea>
      </div>

      {/* Tier info at the bottom */}
      <div className="border-t border-border/50 bg-white/50 py-2">
        <TierDropdown isCollapsed={isCollapsed} />
      </div>
    </motion.div>
  );
};
