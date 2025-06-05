
import { useLocation } from "react-router-dom";
import { NavLink } from "../NavLink";
import { Bell, Settings } from "lucide-react";

interface SettingsNavigationSectionProps {
  isCollapsed: boolean;
}

export const SettingsNavigationSection = ({ isCollapsed }: SettingsNavigationSectionProps) => {
  const { pathname } = useLocation();

  return (
    <>
      <NavLink
        to="/notifications"
        icon={Bell}
        label="Notifications"
        isActive={pathname.includes("/notifications")}
        isCollapsed={isCollapsed}
      />
      <NavLink
        to="/settings"
        icon={Settings}
        label="Settings"
        isActive={pathname.includes("/settings")}
        isCollapsed={isCollapsed}
      />
    </>
  );
};
