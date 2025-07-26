
import React, { lazy } from 'react';
import type { RouteConfig } from './publicRoutes';
import SidebarLayout from '@/components/layout/SidebarLayout';

// Lazy load components for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const FlashcardSetPage = lazy(() => import('@/pages/FlashcardSetPage'));
const CreateFlashcardSetPage = lazy(() => import('@/pages/CreateFlashcardSetPage'));
const CreateFlashcardPage = lazy(() => import('@/pages/CreateFlashcardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const TakeQuizPage = lazy(() => import('@/pages/TakeQuizPage'));
const CreateQuizPage = lazy(() => import('@/pages/CreateQuizPage'));
const NoteToFlashcardPage = lazy(() => import('@/pages/NoteToFlashcardPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const TodoPage = lazy(() => import('@/pages/TodoPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const RemindersPage = lazy(() => import('@/pages/RemindersPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const CollaborationPage = lazy(() => import('@/pages/CollaborationPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const StudyPlannerPage = lazy(() => import('@/pages/StudyPlannerPage'));
const InfluencerDashboardPage = lazy(() => import('@/pages/InfluencerDashboardPage'));

// Legacy route redirects
const ProgressPage = lazy(() => import('@/pages/AnalyticsPage'));
const StudySessionsPage = lazy(() => import('@/pages/AnalyticsPage'));

export const standardRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <SidebarLayout><DashboardPage /></SidebarLayout>
  },
  {
    path: '/flashcards/create',
    element: <SidebarLayout><CreateFlashcardSetPage /></SidebarLayout>
  },
  {
    path: '/flashcards/:setId/create',
    element: <SidebarLayout><CreateFlashcardPage /></SidebarLayout>
  },
  {
    path: '/flashcards/:id',
    element: <SidebarLayout><FlashcardSetPage /></SidebarLayout>
  },
  {
    path: '/flashcards/*',
    element: <SidebarLayout><FlashcardsPage /></SidebarLayout>
  },
  {
    path: '/notes/study/:noteId',
    element: <SidebarLayout><NoteStudyPage /></SidebarLayout>
  },
  {
    path: '/notes/*',
    element: <SidebarLayout><NotesPage /></SidebarLayout>
  },
  {
    path: '/quiz/*',
    element: <SidebarLayout><QuizPage /></SidebarLayout>
  },
  {
    path: '/quizzes/*',
    element: <SidebarLayout><QuizPage /></SidebarLayout>
  },
  {
    path: '/quizzes',
    element: <SidebarLayout><QuizPage /></SidebarLayout>
  },
  {
    path: '/quiz/create',
    element: <SidebarLayout><CreateQuizPage /></SidebarLayout>
  },
  {
    path: '/create-quiz',
    element: <SidebarLayout><CreateQuizPage /></SidebarLayout>
  },
  {
    path: '/note-to-flashcard',
    element: <SidebarLayout><NoteToFlashcardPage /></SidebarLayout>
  },
  {
    path: '/quiz/:id/take',
    element: <SidebarLayout><TakeQuizPage /></SidebarLayout>
  },
  {
    path: '/analytics',
    element: <SidebarLayout><AnalyticsPage /></SidebarLayout>
  },
  // Legacy redirects - these will render the new AnalyticsPage
  {
    path: '/progress',
    element: <SidebarLayout><ProgressPage /></SidebarLayout>
  },
  {
    path: '/study-sessions',
    element: <SidebarLayout><StudySessionsPage /></SidebarLayout>
  },
  {
    path: '/goals',
    element: <SidebarLayout><GoalsPage /></SidebarLayout>
  },
  {
    path: '/todos',
    element: <SidebarLayout><TodoPage /></SidebarLayout>
  },
  {
    path: '/schedule',
    element: <SidebarLayout><SchedulePage /></SidebarLayout>
  },
  {
    path: '/study-planner',
    element: <SidebarLayout><StudyPlannerPage /></SidebarLayout>
  },
  {
    path: '/reminders',
    element: <SidebarLayout><RemindersPage /></SidebarLayout>
  },
  {
    path: '/settings',
    element: <SidebarLayout><SettingsPage /></SidebarLayout>
  },
  {
    path: '/feedback',
    element: <SidebarLayout><FeedbackPage /></SidebarLayout>
  },
  {
    path: '/referrals',
    element: <SidebarLayout><ReferralsPage /></SidebarLayout>
  },
  {
    path: '/collaboration',
    element: <SidebarLayout><CollaborationPage /></SidebarLayout>
  },
  {
    path: '/chat/*',
    element: <SidebarLayout><ChatPage /></SidebarLayout>
  },
  {
    path: '/help',
    element: <SidebarLayout><HelpPage /></SidebarLayout>
  },
  {
    path: '/faq',
    element: <SidebarLayout><FAQPage /></SidebarLayout>
  },
  {
    path: '/influencer',
    element: <SidebarLayout><InfluencerDashboardPage /></SidebarLayout>
  }
];
