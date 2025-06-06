
import { lazy } from 'react';
import { FeatureProtectedRoute } from '@/components/routes/FeatureProtectedRoute';
import { RouteConfig } from './publicRoutes';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyView = lazy(() => import('@/components/notes/study/NoteStudyView'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const CreateFlashcardPage = lazy(() => import('@/pages/CreateFlashcardPage'));
const FlashcardStudyPage = lazy(() => import('@/pages/study/SimplifiedStudyPageLayout'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const QuizTakingPage = lazy(() => import('@/pages/TakeQuizPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));

export const standardRoutes: RouteConfig[] = [
  {
    path: "/dashboard",
    element: <DashboardPage />
  },
  {
    path: "/notes",
    element: <NotesPage />
  },
  {
    path: "/notes/:id",
    element: <NoteStudyView />
  },
  {
    path: "/flashcards",
    element: <FlashcardsPage />
  },
  {
    path: "/flashcards/create",
    element: <CreateFlashcardPage />
  },
  {
    path: "/flashcards/:id/study",
    element: <FlashcardStudyPage />
  },
  {
    path: "/quiz",
    element: <QuizPage />
  },
  {
    path: "/quizzes", 
    element: <QuizPage />
  },
  {
    path: "/quiz/:id",
    element: <QuizTakingPage />
  },
  {
    path: "/settings",
    element: <SettingsPage />
  },
  {
    path: "/referrals",
    element: <ReferralsPage />
  }
];
