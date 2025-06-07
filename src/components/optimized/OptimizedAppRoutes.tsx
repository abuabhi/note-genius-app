
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { LazyLoadWrapper } from '@/components/performance/LazyLoadWrapper';

// Lazy load all major pages for code splitting
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const OptimizedNotesPage = lazy(() => import('@/pages/OptimizedNotesPage'));
const OptimizedFlashcardsPage = lazy(() => import('@/pages/OptimizedFlashcardsPage'));
const OptimizedProgressPage = lazy(() => import('@/pages/OptimizedProgressPage'));
const OptimizedStudySessionsPage = lazy(() => import('@/pages/OptimizedStudySessionsPage'));
const OptimizedNoteStudyPage = lazy(() => import('@/pages/OptimizedNoteStudyPage'));

// Add missing pages
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const TodoPage = lazy(() => import('@/pages/TodoPage'));

// Loading components for each page type
const PageLoadingSkeleton = ({ type }: { type: 'dashboard' | 'notes' | 'flashcards' | 'progress' | 'sessions' | 'goals' | 'todos' }) => {
  const skeletons = {
    dashboard: (
      <Layout>
        <div className="container mx-auto p-6 space-y-8">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    notes: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    flashcards: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-40 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    progress: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
            <div className="h-64 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </Layout>
    ),
    sessions: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    goals: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    ),
    todos: (
      <Layout>
        <div className="container mx-auto p-6 space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="space-y-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Layout>
    )
  };

  return skeletons[type];
};

export const OptimizedAppRoutes = () => {
  return (
    <Routes>
      <Route 
        path="/dashboard" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="dashboard" />}>
            <DashboardPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/notes" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="notes" />}>
            <OptimizedNotesPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/notes/:id" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="notes" />}>
            <OptimizedNoteStudyPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/flashcards" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="flashcards" />}>
            <OptimizedFlashcardsPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/progress" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="progress" />}>
            <OptimizedProgressPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/study-sessions" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="sessions" />}>
            <OptimizedStudySessionsPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/goals" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="goals" />}>
            <GoalsPage />
          </LazyLoadWrapper>
        } 
      />
      <Route 
        path="/todos" 
        element={
          <LazyLoadWrapper fallback={<PageLoadingSkeleton type="todos" />}>
            <TodoPage />
          </LazyLoadWrapper>
        } 
      />
    </Routes>
  );
};
