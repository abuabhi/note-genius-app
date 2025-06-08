
import { RouteObject } from 'react-router-dom';
import DashboardPage from '@/pages/DashboardPage';
import NotesPage from '@/pages/NotesPage';
import EditNotePage from '@/pages/EditNotePage';
import FlashcardsPage from '@/pages/FlashcardsPage';
import CreateFlashcardPage from '@/pages/CreateFlashcardPage';
import EditFlashcardPage from '@/pages/EditFlashcardPage';
import FlashcardSetPage from '@/pages/FlashcardSetPage';
import FlashcardStudyPage from '@/pages/FlashcardStudyPage';
import FlashcardLibraryPage from '@/pages/FlashcardLibraryPage';
import QuizPage from '@/pages/QuizPage';
import CreateQuizPage from '@/pages/CreateQuizPage';
import TakeQuizPage from '@/pages/TakeQuizPage';
import QuizHistoryPage from '@/pages/QuizHistoryPage';
import GoalsPage from '@/pages/GoalsPage';
import ProgressPage from '@/pages/ProgressPage';
import SchedulePage from '@/pages/SchedulePage';
import SettingsPage from '@/pages/SettingsPage';
import TodoPage from '@/pages/TodoPage';
import StudySessionsPage from '@/pages/StudySessionsPage';
import NoteStudyPage from '@/pages/NoteStudyPage';
import NoteToFlashcardPage from '@/pages/NoteToFlashcardPage';
import CollaborationPage from '@/pages/CollaborationPage';
import ChatPage from '@/pages/ChatPage';
import ConnectionsPage from '@/pages/ConnectionsPage';
import NotificationsPage from '@/pages/NotificationsPage';
import ReferralsPage from '@/pages/ReferralsPage';
import FeedbackPage from '@/pages/FeedbackPage';

export const standardRoutes: RouteObject[] = [
  {
    path: '/dashboard',
    element: <DashboardPage />,
  },
  {
    path: '/notes',
    element: <NotesPage />,
  },
  {
    path: '/notes/:noteId',
    element: <EditNotePage />,
  },
  {
    path: '/notes/study/:noteId',
    element: <NoteStudyPage />,
  },
  {
    path: '/notes/convert/:noteId',
    element: <NoteToFlashcardPage />,
  },
  {
    path: '/flashcards',
    element: <FlashcardsPage />,
  },
  {
    path: '/flashcards/create',
    element: <CreateFlashcardPage />,
  },
  {
    path: '/flashcards/edit/:id',
    element: <EditFlashcardPage />,
  },
  {
    path: '/flashcards/sets/:id',
    element: <FlashcardSetPage />,
  },
  {
    path: '/flashcards/study/:id',
    element: <FlashcardStudyPage />,
  },
  {
    path: '/flashcards/library',
    element: <FlashcardLibraryPage />,
  },
  {
    path: '/quiz',
    element: <QuizPage />,
  },
  {
    path: '/quizzes',
    element: <QuizPage />,
  },
  {
    path: '/quiz/create',
    element: <CreateQuizPage />,
  },
  {
    path: '/quiz/take/:id',
    element: <TakeQuizPage />,
  },
  {
    path: '/quiz/history',
    element: <QuizHistoryPage />,
  },
  {
    path: '/goals',
    element: <GoalsPage />,
  },
  {
    path: '/progress',
    element: <ProgressPage />,
  },
  {
    path: '/feedback',
    element: <FeedbackPage />,
  },
  {
    path: '/schedule',
    element: <SchedulePage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
  {
    path: '/todos',
    element: <TodoPage />,
  },
  {
    path: '/study-sessions',
    element: <StudySessionsPage />,
  },
  {
    path: '/collaboration',
    element: <CollaborationPage />,
  },
  {
    path: '/chat',
    element: <ChatPage />,
  },
  {
    path: '/connections',
    element: <ConnectionsPage />,
  },
  {
    path: '/notifications',
    element: <NotificationsPage />,
  },
  {
    path: '/referrals',
    element: <ReferralsPage />,
  },
];
