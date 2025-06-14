
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
    element: createElement(DashboardPage),
    title: 'Dashboard'
  },
  {
    path: '/flashcards/*',
    element: createElement(FlashcardsPage),
    title: 'Flashcards'
  },
  {
    path: '/notes/*',
    element: createElement(NotesPage),
    title: 'Notes'
  },
  {
    path: '/quiz/*',
    element: createElement(QuizPage),
    title: 'Quiz'
  },
  {
    path: '/quizzes/*',
    element: createElement(QuizPage),
    title: 'Quiz'
  },
  {
    path: '/analytics',
    element: createElement(AnalyticsPage),
    title: 'Analytics'
  },
  // Legacy redirects - these will render the new AnalyticsPage
  {
    path: '/progress',
    element: createElement(ProgressPage),
    title: 'Analytics'
  },
  {
    path: '/study-sessions',
    element: createElement(StudySessionsPage),
    title: 'Analytics'
  },
  {
    path: '/goals',
    element: createElement(GoalsPage),
    title: 'Goals'
  },
  {
    path: '/todos',
    element: createElement(TodosPage),
    title: 'ToDo'
  },
  {
    path: '/schedule',
    element: createElement(SchedulePage),
    title: 'Schedule'
  },
  {
    path: '/reminders',
    element: createElement(RemindersPage),
    title: 'Reminders'
  },
  {
    path: '/settings',
    element: createElement(SettingsPage),
    title: 'Settings'
  },
  {
    path: '/feedback',
    element: createElement(FeedbackPage),
    title: 'Feedback'
  },
  {
    path: '/referrals',
    element: createElement(ReferralsPage),
    title: 'Refer & Win'
  },
  {
    path: '/collaboration',
    element: createElement(CollaborationPage),
    title: 'Study Groups'
  },
  {
    path: '/chat/*',
    element: createElement(ChatPage),
    title: 'Messages'
  }
];
