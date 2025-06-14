
import { lazy } from 'react';
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
    element: DashboardPage,
    title: 'Dashboard'
  },
  {
    path: '/flashcards/*',
    element: FlashcardsPage,
    title: 'Flashcards'
  },
  {
    path: '/notes/*',
    element: NotesPage,
    title: 'Notes'
  },
  {
    path: '/quiz/*',
    element: QuizPage,
    title: 'Quiz'
  },
  {
    path: '/quizzes/*',
    element: QuizPage,
    title: 'Quiz'
  },
  {
    path: '/analytics',
    element: AnalyticsPage,
    title: 'Analytics'
  },
  // Legacy redirects - these will render the new AnalyticsPage
  {
    path: '/progress',
    element: ProgressPage,
    title: 'Analytics'
  },
  {
    path: '/study-sessions',
    element: StudySessionsPage,
    title: 'Analytics'
  },
  {
    path: '/goals',
    element: GoalsPage,
    title: 'Goals'
  },
  {
    path: '/todos',
    element: TodosPage,
    title: 'ToDo'
  },
  {
    path: '/schedule',
    element: SchedulePage,
    title: 'Schedule'
  },
  {
    path: '/reminders',
    element: RemindersPage,
    title: 'Reminders'
  },
  {
    path: '/settings',
    element: SettingsPage,
    title: 'Settings'
  },
  {
    path: '/feedback',
    element: FeedbackPage,
    title: 'Feedback'
  },
  {
    path: '/referrals',
    element: ReferralsPage,
    title: 'Refer & Win'
  },
  {
    path: '/collaboration',
    element: CollaborationPage,
    title: 'Study Groups'
  },
  {
    path: '/chat/*',
    element: ChatPage,
    title: 'Messages'
  }
];
