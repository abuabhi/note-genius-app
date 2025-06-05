
import { useLocation } from "react-router-dom";
import { NavLink } from "../NavLink";
import { Calendar, Target, ListTodo } from "lucide-react";

interface PlanningNavigationSectionProps {
  isCollapsed: boolean;
  isScheduleVisible: boolean;
  isGoalsVisible: boolean;
  isTodosVisible: boolean;
}

export const PlanningNavigationSection = ({ 
  isCollapsed, 
  isScheduleVisible, 
  isGoalsVisible, 
  isTodosVisible 
}: PlanningNavigationSectionProps) => {
  const { pathname } = useLocation();

  if (!isScheduleVisible && !isGoalsVisible && !isTodosVisible) {
    return null;
  }

  return (
    <>
      {isScheduleVisible && (
        <NavLink
          to="/schedule"
          icon={Calendar}
          label="Schedule"
          isActive={pathname.includes("/schedule")}
          isCollapsed={isCollapsed}
        />
      )}
      {isGoalsVisible && (
        <NavLink
          to="/goals"
          icon={Target}
          label="Goals"
          isActive={pathname.includes("/goals")}
          isCollapsed={isCollapsed}
        />
      )}
      {isTodosVisible && (
        <NavLink
          to="/todos"
          icon={ListTodo}
          label="Todos"
          isActive={pathname.includes("/todos")}
          isCollapsed={isCollapsed}
        />
      )}
    </>
  );
};
