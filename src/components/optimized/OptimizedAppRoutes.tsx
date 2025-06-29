
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';

// Lazy load all page components
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const AcademicCalendarPage = lazy(() => import('@/pages/AcademicCalendarPage'));

// Global loading component for route transitions
const RouteLoadingSkeleton = () => (
  <SidebarLayout>
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <div className="container mx-auto p-4 md:p-6">
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded animate-pulse" />
          <div className="grid gap-4">
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-32 bg-gray-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  </SidebarLayout>
);

export const OptimizedAppRoutes = () => {
  return (
    <Suspense fallback={<RouteLoadingSkeleton />}>
      <Routes>
        <Route path="/dashboard" element={
          <SidebarLayout>
            <DashboardPage />
          </SidebarLayout>
        } />
        <Route path="/notes" element={
          <SidebarLayout>
            <NotesPage />
          </SidebarLayout>
        } />
        <Route path="/notes/:id" element={
          <SidebarLayout>
            <NoteStudyPage />
          </SidebarLayout>
        } />
        <Route path="/academic-calendar" element={
          <SidebarLayout>
            <AcademicCalendarPage />
          </SidebarLayout>
        } />
        {/* Add other routes as needed */}
      </Routes>
    </Suspense>
  );
};
