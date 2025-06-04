
import React from 'react';
import StudySessionsPage from "@/pages/StudySessionsPage";
import ProgressPage from "@/pages/ProgressPage";
import SchedulePage from "@/pages/SchedulePage";
import QuizPage from "@/pages/QuizPage";
import CreateQuizPage from "@/pages/CreateQuizPage";
import TakeQuizPage from "@/pages/TakeQuizPage";
import ChatPage from "@/pages/ChatPage";
import GoalsPage from "@/pages/GoalsPage";
import TodoPage from "@/pages/TodoPage";
import CollaborationPage from "@/pages/CollaborationPage";
import ConnectionsPage from "@/pages/ConnectionsPage";
import { FeatureProtectedRoute } from '@/components/routes/FeatureProtectedRoute';
import { RouteConfig } from './publicRoutes';

// Feature-protected routes that require specific features to be enabled
export const featureProtectedRoutes: RouteConfig[] = [
  {
    path: "/study-sessions",
    element: (
      <FeatureProtectedRoute featureKey="study_sessions">
        <StudySessionsPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/progress",
    element: (
      <FeatureProtectedRoute featureKey="progress">
        <ProgressPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/schedule",
    element: (
      <FeatureProtectedRoute featureKey="schedule">
        <SchedulePage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/goals",
    element: (
      <FeatureProtectedRoute featureKey="goals">
        <GoalsPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/todos",
    element: (
      <FeatureProtectedRoute featureKey="todos">
        <TodoPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/quizzes",
    element: (
      <FeatureProtectedRoute featureKey="quizzes">
        <QuizPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/create-quiz",
    element: (
      <FeatureProtectedRoute featureKey="quizzes">
        <CreateQuizPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/quiz/take/:quizId",
    element: (
      <FeatureProtectedRoute featureKey="quizzes">
        <TakeQuizPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/chat",
    element: (
      <FeatureProtectedRoute featureKey="chat">
        <ChatPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/collaboration",
    element: (
      <FeatureProtectedRoute featureKey="collaboration">
        <CollaborationPage />
      </FeatureProtectedRoute>
    ),
  },
  {
    path: "/connections",
    element: (
      <FeatureProtectedRoute featureKey="connections">
        <ConnectionsPage />
      </FeatureProtectedRoute>
    ),
  },
];
