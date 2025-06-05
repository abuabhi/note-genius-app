
import { useLocation } from "react-router-dom";
import { NavLink } from "../NavLink";
import { Activity } from "lucide-react";

interface ProgressNavigationSectionProps {
  isCollapsed: boolean;
  isProgressVisible: boolean;
}

export const ProgressNavigationSection = ({ 
  isCollapsed, 
  isProgressVisible 
}: ProgressNavigationSectionProps) => {
  const { pathname } = useLocation();

  if (!isProgressVisible) {
    return null;
  }

  return (
    <NavLink
      to="/progress"
      icon={Activity}
      label="Progress"
      isActive={pathname.includes("/progress")}
      isCollapsed={isCollapsed}
    />
  );
};
