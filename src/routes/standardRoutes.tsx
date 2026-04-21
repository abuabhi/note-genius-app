
import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import type { RouteConfig } from './publicRoutes';
// import SidebarLayout from '@/components/layout/SidebarLayout'; // Not needed - using global SidebarProvider

// Lazy load components for better performance
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const FlashcardSetPage = lazy(() => import('@/pages/FlashcardSetPage'));
const CreateFlashcardSetPage = lazy(() => import('@/pages/CreateFlashcardSetPage'));
const CreateFlashcardPage = lazy(() => import('@/pages/CreateFlashcardPage'));
const FlashcardStudyPage = lazy(() => import('@/pages/FlashcardStudyPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const TakeQuizPage = lazy(() => import('@/pages/TakeQuizPage'));
const CreateQuizPage = lazy(() => import('@/pages/CreateQuizPage'));
const NoteToFlashcardPage = lazy(() => import('@/pages/NoteToFlashcardPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const QuizDetailsPage = lazy(() => import('@/pages/QuizDetailsPage'));
const InfluencerDashboardPage = lazy(() => import('@/pages/InfluencerDashboardPage'));
const ResourcesPage = lazy(() => import('@/pages/ResourcesPage'));
const BlogPage = lazy(() => import('@/pages/BlogPage'));
const BlogPostPage = lazy(() => import('@/pages/BlogPostPage'));


export const standardRoutes: RouteConfig[] = [
  {
    path: '/dashboard',
    element: <DashboardPage />
  },
  {
    path: '/flashcards/create',
    element: <CreateFlashcardSetPage />
  },
  {
    path: '/flashcards/:setId/create',
    element: <CreateFlashcardPage />
  },
  {
    path: '/flashcards/study/:id',
    element: <FlashcardStudyPage />
  },
  {
    path: '/flashcards/:id',
    element: <FlashcardSetPage />
  },
  {
    path: '/flashcards/*',
    element: <FlashcardsPage />
  },
  {
    path: '/notes/study/:noteId',
    element: <NoteStudyPage />
  },
  {
    path: '/notes/*',
    element: <NotesPage />
  },
  {
    path: '/quiz/create',
    element: <CreateQuizPage />
  },
  {
    path: '/create-quiz',
    element: <CreateQuizPage />
  },
  {
    path: '/quiz/:id/take',
    element: <TakeQuizPage />
  },
  {
    path: '/quiz/:id',
    element: <QuizDetailsPage />
  },
  {
    path: '/note-to-flashcard',
    element: <NoteToFlashcardPage />
  },
  {
    path: '/quiz/*',
    element: <QuizPage />
  },
  {
    path: '/quizzes/*',
    element: <QuizPage />
  },
  {
    path: '/quizzes',
    element: <QuizPage />
  },
  {
    path: '/analytics',
    element: <AnalyticsPage />
  },
  // Legacy redirects → analytics
  {
    path: '/progress',
    element: <Navigate to="/analytics" replace />
  },
  {
    path: '/study-sessions',
    element: <Navigate to="/analytics" replace />
  },
  {
    path: '/goals',
    element: <GoalsPage />
  },
  {
    path: '/todos',
    element: <Navigate to="/goals" replace />
  },
  {
    path: '/schedule',
    element: <SchedulePage />
  },
  // Merged into /schedule — keep redirects so old links/bookmarks still work
  {
    path: '/study-planner',
    element: <Navigate to="/schedule" replace />
  },
  {
    path: '/reminders',
    element: <Navigate to="/schedule?tab=reminders" replace />
  },
  {
    path: '/settings',
    element: <SettingsPage />
  },
  {
    path: '/feedback',
    element: <FeedbackPage />
  },
  {
    path: '/referrals',
    element: <ReferralsPage />
  },
  {
    path: '/influencer',
    element: <InfluencerDashboardPage />
  },
  {
    path: '/resources',
    element: <ResourcesPage />
  },
  {
    path: '/blog',
    element: <BlogPage />
  },
  {
    path: '/blog/:slug',
    element: <BlogPostPage />
  },
];
