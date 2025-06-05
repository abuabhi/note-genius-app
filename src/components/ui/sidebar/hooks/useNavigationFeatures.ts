
import { useFeatures } from "@/contexts/FeatureContext";

export const useNavigationFeatures = () => {
  // Use features with fallback - if context fails, default to showing core features
  let isFeatureEnabled: (key: string) => boolean;
  let isFeatureVisible: (key: string) => boolean;
  
  try {
    const features = useFeatures();
    isFeatureEnabled = features.isFeatureEnabled;
    isFeatureVisible = features.isFeatureVisible;
  } catch (error) {
    console.error('Features context error, using fallbacks:', error);
    // Fallback: show core features, hide optional ones
    isFeatureEnabled = (key: string) => {
      const coreFeatures = ['notes', 'flashcards', 'dashboard'];
      return coreFeatures.includes(key);
    };
    isFeatureVisible = (key: string) => {
      const coreFeatures = ['notes', 'flashcards', 'dashboard'];
      return coreFeatures.includes(key);
    };
  }
  
  // Define feature keys for standard app features
  const FEATURE_KEYS = {
    CHAT: "chat",
    COLLABORATION: "collaboration",
    CONNECTIONS: "connections",
    STUDY_SESSIONS: "study_sessions",
    TODOS: "todos",
    PROGRESS: "progress",
    GOALS: "goals", 
    SCHEDULE: "schedule",
    QUIZZES: "quizzes"
  };
  
  // Determine if specific features are visible (with fallbacks)
  const isChatVisible = isFeatureVisible(FEATURE_KEYS.CHAT);
  const isCollaborationVisible = isFeatureVisible(FEATURE_KEYS.COLLABORATION);
  const isConnectionsVisible = isFeatureVisible(FEATURE_KEYS.CONNECTIONS);
  const isStudySessionsVisible = isFeatureVisible(FEATURE_KEYS.STUDY_SESSIONS);
  const isTodosVisible = isFeatureVisible(FEATURE_KEYS.TODOS);
  const isProgressVisible = isFeatureVisible(FEATURE_KEYS.PROGRESS);
  const isGoalsVisible = isFeatureVisible(FEATURE_KEYS.GOALS);
  const isScheduleVisible = isFeatureVisible(FEATURE_KEYS.SCHEDULE);
  const isQuizzesVisible = isFeatureVisible(FEATURE_KEYS.QUIZZES);
  
  // Function to check if any items in a section are visible
  const isAnyCommunicationItemVisible = isChatVisible || isCollaborationVisible || isConnectionsVisible;
  const isAnyStudyItemVisible = isStudySessionsVisible || isQuizzesVisible;
  const isAnyPlanningItemVisible = isScheduleVisible || isGoalsVisible || isTodosVisible;

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
