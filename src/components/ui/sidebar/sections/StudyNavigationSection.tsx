
import { useLocation } from "react-router-dom";
import { NavLink } from "../NavLink";
import { Clock, Activity } from "lucide-react";

interface StudyNavigationSectionProps {
  isCollapsed: boolean;
  isStudySessionsVisible: boolean;
  isQuizzesVisible: boolean;
}

export const StudyNavigationSection = ({ 
  isCollapsed, 
  isStudySessionsVisible, 
  isQuizzesVisible 
}: StudyNavigationSectionProps) => {
  const { pathname } = useLocation();

  if (!isStudySessionsVisible && !isQuizzesVisible) {
    return null;
  }

  return (
    <>
      {isStudySessionsVisible && (
        <NavLink
          to="/study-sessions"
          icon={Clock}
          label="Study Sessions"
          isActive={pathname.includes("/study-sessions")}
          isCollapsed={isCollapsed}
        />
      )}
      {isQuizzesVisible && (
        <NavLink
          to="/quizzes"
          icon={Activity}
          label="Quizzes"
          isActive={pathname.includes("/quizzes")}
          isCollapsed={isCollapsed}
        />
      )}
    </>
  );
};
