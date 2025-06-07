
import { lazy } from 'react';
import { RouteConfig } from './publicRoutes';

const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const EditNotePage = lazy(() => import('@/pages/EditNotePage'));
const NoteToFlashcardPage = lazy(() => import('@/pages/NoteToFlashcardPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const CreateFlashcardPage = lazy(() => import('@/pages/CreateFlashcardPage'));
const FlashcardStudyPage = lazy(() => import('@/pages/FlashcardStudyPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const QuizTakingPage = lazy(() => import('@/pages/TakeQuizPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const TodoPage = lazy(() => import('@/pages/TodoPage'));
const StudySessionsPage = lazy(() => import('@/pages/StudySessionsPage'));
const ProgressPage = lazy(() => import('@/pages/ProgressPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const CollaborationPage = lazy(() => import('@/pages/CollaborationPage'));
const ConnectionsPage = lazy(() => import('@/pages/ConnectionsPage'));

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
    element: <NoteStudyPage />
  },
  {
    path: "/edit-note/:noteId",
    element: <EditNotePage />
  },
  {
    path: "/note-to-flashcard",
    element: <NoteToFlashcardPage />
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
    path: "/goals",
    element: <GoalsPage />
  },
  {
    path: "/todos",
    element: <TodoPage />
  },
  {
    path: "/study-sessions",
    element: <StudySessionsPage />
  },
  {
    path: "/progress",
    element: <ProgressPage />
  },
  {
    path: "/schedule",
    element: <SchedulePage />
  },
  {
    path: "/chat",
    element: <ChatPage />
  },
  {
    path: "/collaboration",
    element: <CollaborationPage />
  },
  {
    path: "/connections",
    element: <ConnectionsPage />
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
