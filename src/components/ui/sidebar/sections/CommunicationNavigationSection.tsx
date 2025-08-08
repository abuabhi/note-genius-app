
import { useLocation } from "react-router-dom";
import { NavLink } from "../NavLink";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MessageSquare, Users, UserCheck } from "lucide-react";

interface CommunicationNavigationSectionProps {
  isCollapsed: boolean;
  isChatVisible: boolean;
  isCollaborationVisible: boolean;
  isConnectionsVisible: boolean;
}

export const CommunicationNavigationSection = ({ 
  isCollapsed, 
  isChatVisible, 
  isCollaborationVisible, 
  isConnectionsVisible 
}: CommunicationNavigationSectionProps) => {
  const { pathname } = useLocation();

  if (!isChatVisible && !isCollaborationVisible && !isConnectionsVisible) {
    return null;
  }

  return (
    <>
      {isChatVisible && (
        <NavLink
          to="/chat"
          icon={MessageSquare}
          label="Chat"
          isActive={pathname.includes("/chat")}
          isCollapsed={isCollapsed}
          badge={
            <Badge
              variant="contrast"
              className={cn("px-1.5 py-0.5 text-[10px]")}
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
    </>
  );
};
