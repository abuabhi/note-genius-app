
// Simplified navigation features hook - all features are now permanently visible
export const useNavigationFeatures = () => {
  // All features are now permanently visible
  const isChatVisible = false;
  const isCollaborationVisible = false;
  const isConnectionsVisible = false;
  const isStudySessionsVisible = true;
  const isTodosVisible = true;
  const isProgressVisible = true;
  const isGoalsVisible = true;
  const isScheduleVisible = true;
  const isQuizzesVisible = true;
  
  // All communication, study, and planning items are visible
  const isAnyCommunicationItemVisible = false;
  const isAnyStudyItemVisible = true;
  const isAnyPlanningItemVisible = true;

  return {
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
  };
};
