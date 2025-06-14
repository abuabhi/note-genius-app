
import { lazy, createElement } from 'react';
import type { RouteConfig } from './publicRoutes';

// Lazy load components for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const TodosPage = lazy(() => import('@/pages/TodosPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const RemindersPage = lazy(() => import('@/pages/RemindersPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const CollaborationPage = lazy(() => import('@/pages/CollaborationPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));

// Legacy route redirects
const ProgressPage = lazy(() => import('@/pages/AnalyticsPage'));
const StudySessionsPage = lazy(() => import('@/pages/AnalyticsPage'));

export const standardRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: createElement(DashboardPage)
  },
  {
    path: '/flashcards/*',
    element: createElement(FlashcardsPage)
  },
  {
    path: '/notes/*',
    element: createElement(NotesPage)
  },
  {
    path: '/quiz/*',
    element: createElement(QuizPage)
  },
  {
    path: '/quizzes/*',
    element: createElement(QuizPage)
  },
  {
    path: '/analytics',
    element: createElement(AnalyticsPage)
  },
  // Legacy redirects - these will render the new AnalyticsPage
  {
    path: '/progress',
    element: createElement(ProgressPage)
  },
  {
    path: '/study-sessions',
    element: createElement(StudySessionsPage)
  },
  {
    path: '/goals',
    element: createElement(GoalsPage)
  },
  {
    path: '/todos',
    element: createElement(TodosPage)
  },
  {
    path: '/schedule',
    element: createElement(SchedulePage)
  },
  {
    path: '/reminders',
    element: createElement(RemindersPage)
  },
  {
    path: '/settings',
    element: createElement(SettingsPage)
  },
  {
    path: '/feedback',
    element: createElement(FeedbackPage)
  },
  {
    path: '/referrals',
    element: createElement(ReferralsPage)
  },
  {
    path: '/collaboration',
    element: createElement(CollaborationPage)
  },
  {
    path: '/chat/*',
    element: createElement(ChatPage)
  }
];
