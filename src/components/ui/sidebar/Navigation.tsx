
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { motion } from "framer-motion";
import { staggerVariants } from "./motion";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Separator } from "@/components/ui/separator";
import { useNavigationFeatures } from "./hooks/useNavigationFeatures";
import { CoreNavigationSection } from "./sections/CoreNavigationSection";
import { StudyNavigationSection } from "./sections/StudyNavigationSection";
import { PlanningNavigationSection } from "./sections/PlanningNavigationSection";
import { ProgressNavigationSection } from "./sections/ProgressNavigationSection";
import { CommunicationNavigationSection } from "./sections/CommunicationNavigationSection";
import { SettingsNavigationSection } from "./sections/SettingsNavigationSection";

interface NavigationProps {
  isCollapsed: boolean;
}

export const Navigation = ({ isCollapsed }: NavigationProps) => {
  const { userProfile } = useRequireAuth();
  const {
    isChatVisible,
    isCollaborationVisible,
    isConnectionsVisible,
    isStudySessionsVisible,
    isTodosVisible,
    isProgressVisible,
    isGoalsVisible,
    isScheduleVisible,
    isQuizzesVisible,
    isAnyCommunicationItemVisible,
    isAnyStudyItemVisible,
    isAnyPlanningItemVisible
  } = useNavigationFeatures();
  
  return (
    <motion.ul variants={staggerVariants} className="flex h-full flex-col">
      <div className="flex grow flex-col items-center">
        <div className="flex h-full w-full flex-col">
          <div className="flex grow flex-col gap-4">
            <ScrollArea className="h-16 grow p-2">
              <div className={cn("flex w-full flex-col gap-1")}>
                {/* Main Section - Core Features Always Visible */}
                <Separator className="my-2" />
                <CoreNavigationSection isCollapsed={isCollapsed} />
                
                {/* Study Tools Section - Optional features */}
                {isAnyStudyItemVisible && <Separator className="my-2" />}
                <StudyNavigationSection 
                  isCollapsed={isCollapsed}
                  isStudySessionsVisible={isStudySessionsVisible}
                  isQuizzesVisible={isQuizzesVisible}
                />

                {/* Planning Section - only show if any planning items are visible */}
                {isAnyPlanningItemVisible && <Separator className="my-2" />}
                <PlanningNavigationSection 
                  isCollapsed={isCollapsed}
                  isScheduleVisible={isScheduleVisible}
                  isGoalsVisible={isGoalsVisible}
                  isTodosVisible={isTodosVisible}
                />

                {/* Progress Section - only show if visible */}
                {isProgressVisible && (
                  <>
                    <Separator className="my-2" />
                    <ProgressNavigationSection 
                      isCollapsed={isCollapsed}
                      isProgressVisible={isProgressVisible}
                    />
                  </>
                )}

                {/* Communication Section - only show if any comm items are visible */}
                {isAnyCommunicationItemVisible && <Separator className="my-2" />}
                <CommunicationNavigationSection 
                  isCollapsed={isCollapsed}
                  isChatVisible={isChatVisible}
                  isCollaborationVisible={isCollaborationVisible}
                  isConnectionsVisible={isConnectionsVisible}
                />

                {/* Settings & Notifications Section */}
                <Separator className="my-2" />
                <SettingsNavigationSection isCollapsed={isCollapsed} />
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </motion.ul>
  );
};
