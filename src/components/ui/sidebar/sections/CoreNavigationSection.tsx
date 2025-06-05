
import { useLocation } from "react-router-dom";
import { NavLink } from "../NavLink";
import { LayoutDashboard, FileText, BookOpen } from "lucide-react";

interface CoreNavigationSectionProps {
  isCollapsed: boolean;
}

export const CoreNavigationSection = ({ isCollapsed }: CoreNavigationSectionProps) => {
  const { pathname } = useLocation();

  return (
    <>
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
    </>
  );
};
