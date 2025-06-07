
// Simplified navigation features hook - all features are now permanently visible
export const useNavigationFeatures = () => {
  // All features are now permanently visible
  const isChatVisible = true;
  const isCollaborationVisible = true;
  const isConnectionsVisible = true;
  const isStudySessionsVisible = true;
  const isTodosVisible = true;
  const isProgressVisible = true;
  const isGoalsVisible = true;
  const isScheduleVisible = true;
  const isQuizzesVisible = true;
  
  // All communication, study, and planning items are visible
  const isAnyCommunicationItemVisible = true;
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
