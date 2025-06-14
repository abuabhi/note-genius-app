
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
    component: DashboardPage,
    title: 'Dashboard'
  },
  {
    path: '/flashcards/*',
    component: FlashcardsPage,
    title: 'Flashcards'
  },
  {
    path: '/notes/*',
    component: NotesPage,
    title: 'Notes'
  },
  {
    path: '/quiz/*',
    component: QuizPage,
    title: 'Quiz'
  },
  {
    path: '/quizzes/*',
    component: QuizPage,
    title: 'Quiz'
  },
  {
    path: '/analytics',
    component: AnalyticsPage,
    title: 'Analytics'
  },
  // Legacy redirects - these will render the new AnalyticsPage
  {
    path: '/progress',
    component: ProgressPage,
    title: 'Analytics'
  },
  {
    path: '/study-sessions',
    component: StudySessionsPage,
    title: 'Analytics'
  },
  {
    path: '/goals',
    component: GoalsPage,
    title: 'Goals'
  },
  {
    path: '/todos',
    component: TodosPage,
    title: 'ToDo'
  },
  {
    path: '/schedule',
    component: SchedulePage,
    title: 'Schedule'
  },
  {
    path: '/reminders',
    component: RemindersPage,
    title: 'Reminders'
  },
  {
    path: '/settings',
    component: SettingsPage,
    title: 'Settings'
  },
  {
    path: '/feedback',
    component: FeedbackPage,
    title: 'Feedback'
  },
  {
    path: '/referrals',
    component: ReferralsPage,
    title: 'Refer & Win'
  },
  {
    path: '/collaboration',
    component: CollaborationPage,
    title: 'Study Groups'
  },
  {
    path: '/chat/*',
    component: ChatPage,
    title: 'Messages'
  }
];
