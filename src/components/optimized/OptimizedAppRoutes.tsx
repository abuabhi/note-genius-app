
import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import SidebarLayout from '@/components/layout/SidebarLayout';
import { AdminRoute } from '@/components/auth/AdminRoute';

// Lazy load all page components
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const NotesPage = lazy(() => import('@/pages/NotesPage'));
const NoteStudyPage = lazy(() => import('@/pages/NoteStudyPage'));
const FlashcardsPage = lazy(() => import('@/pages/FlashcardsPage'));
const QuizPage = lazy(() => import('@/pages/QuizPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const GoalsPage = lazy(() => import('@/pages/GoalsPage'));
const TodoPage = lazy(() => import('@/pages/TodoPage'));
const SchedulePage = lazy(() => import('@/pages/SchedulePage'));
const RemindersPage = lazy(() => import('@/pages/RemindersPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const HelpPage = lazy(() => import('@/pages/HelpPage'));
const FAQPage = lazy(() => import('@/pages/FAQPage'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const ReferralsPage = lazy(() => import('@/pages/ReferralsPage'));
const CollaborationPage = lazy(() => import('@/pages/CollaborationPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const NoteToFlashcardPage = lazy(() => import('@/pages/NoteToFlashcardPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/AdminDashboardPage'));
const AdminSystemMonitoringPage = lazy(() => import('@/pages/AdminSystemMonitoringPage'));
const AdminUsersPage = lazy(() => import('@/pages/AdminUsersPage'));
const AdminContactSubmissionsPage = lazy(() => import('@/pages/AdminContactSubmissionsPage'));
const AdminFeedbackPage = lazy(() => import('@/pages/AdminFeedbackPage'));
const AdminFeedbackSettingsPage = lazy(() => import('@/pages/AdminFeedbackSettingsPage'));
const AdminAnalyticsPage = lazy(() => import('@/pages/AdminAnalyticsPage'));
const AdminAnnouncementsPage = lazy(() => import('@/pages/AdminAnnouncementsPage'));
const AdminFlashcardPage = lazy(() => import('@/pages/AdminFlashcardPage'));
const AdminSectionsPage = lazy(() => import('@/pages/AdminSectionsPage'));
const AdminGradesPage = lazy(() => import('@/pages/AdminGradesPage'));
const AdminSubjectsPage = lazy(() => import('@/pages/AdminSubjectsPage'));
const AdminCSVImportPage = lazy(() => import('@/pages/AdminCSVImportPage'));
const AdminTierLimitsPage = lazy(() => import('@/pages/AdminTierLimitsPage'));

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
        {/* Dashboard */}
        <Route path="/dashboard" element={
          <SidebarLayout>
            <DashboardPage />
          </SidebarLayout>
        } />
        
        {/* Notes */}
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
        
        {/* Flashcards */}
        <Route path="/flashcards/*" element={
          <SidebarLayout>
            <FlashcardsPage />
          </SidebarLayout>
        } />
        
        {/* Quiz */}
        <Route path="/quiz/*" element={
          <SidebarLayout>
            <QuizPage />
          </SidebarLayout>
        } />
        <Route path="/quizzes/*" element={
          <SidebarLayout>
            <QuizPage />
          </SidebarLayout>
        } />
        
        {/* Analytics */}
        <Route path="/analytics" element={
          <SidebarLayout>
            <AnalyticsPage />
          </SidebarLayout>
        } />
        <Route path="/progress" element={
          <SidebarLayout>
            <AnalyticsPage />
          </SidebarLayout>
        } />
        <Route path="/study-sessions" element={
          <SidebarLayout>
            <AnalyticsPage />
          </SidebarLayout>
        } />
        
        {/* Goals */}
        <Route path="/goals" element={
          <SidebarLayout>
            <GoalsPage />
          </SidebarLayout>
        } />
        
        {/* Todos */}
        <Route path="/todos" element={
          <SidebarLayout>
            <TodoPage />
          </SidebarLayout>
        } />
        
        {/* Schedule */}
        <Route path="/schedule" element={
          <SidebarLayout>
            <SchedulePage />
          </SidebarLayout>
        } />
        
        {/* Reminders */}
        <Route path="/reminders" element={
          <SidebarLayout>
            <RemindersPage />
          </SidebarLayout>
        } />
        
        {/* Settings */}
        <Route path="/settings" element={
          <SidebarLayout>
            <SettingsPage />
          </SidebarLayout>
        } />
        
        {/* Help */}
        <Route path="/help" element={
          <SidebarLayout>
            <HelpPage />
          </SidebarLayout>
        } />
        
        {/* FAQ */}
        <Route path="/faq" element={
          <SidebarLayout>
            <FAQPage />
          </SidebarLayout>
        } />
        
        {/* Feedback */}
        <Route path="/feedback" element={
          <SidebarLayout>
            <FeedbackPage />
          </SidebarLayout>
        } />
        
        {/* Referrals */}
        <Route path="/referrals" element={
          <SidebarLayout>
            <ReferralsPage />
          </SidebarLayout>
        } />
        
        {/* Collaboration */}
        <Route path="/collaboration" element={
          <SidebarLayout>
            <CollaborationPage />
          </SidebarLayout>
        } />
        
        {/* Chat */}
        <Route path="/chat/*" element={
          <SidebarLayout>
            <ChatPage />
          </SidebarLayout>
        } />
        
        {/* Note to Flashcard */}
        <Route path="/note-to-flashcard" element={
          <SidebarLayout>
            <NoteToFlashcardPage />
          </SidebarLayout>
        } />
        
        {/* Onboarding - no sidebar layout */}
        <Route path="/onboarding" element={<OnboardingPage />} />
        
        {/* Admin Routes - Protected */}
        <Route path="/admin/*" element={<AdminRoute />}>
          <Route index element={
            <SidebarLayout>
              <AdminDashboardPage />
            </SidebarLayout>
          } />
          <Route path="system-monitoring" element={
            <SidebarLayout>
              <AdminSystemMonitoringPage />
            </SidebarLayout>
          } />
          <Route path="users" element={
            <SidebarLayout>
              <AdminUsersPage />
            </SidebarLayout>
          } />
          <Route path="contact-submissions" element={
            <SidebarLayout>
              <AdminContactSubmissionsPage />
            </SidebarLayout>
          } />
          <Route path="feedback" element={
            <SidebarLayout>
              <AdminFeedbackPage />
            </SidebarLayout>
          } />
          <Route path="feedback/settings" element={
            <SidebarLayout>
              <AdminFeedbackSettingsPage />
            </SidebarLayout>
          } />
          <Route path="analytics" element={
            <SidebarLayout>
              <AdminAnalyticsPage />
            </SidebarLayout>
          } />
          <Route path="announcements" element={
            <SidebarLayout>
              <AdminAnnouncementsPage />
            </SidebarLayout>
          } />
          <Route path="flashcards" element={
            <SidebarLayout>
              <AdminFlashcardPage />
            </SidebarLayout>
          } />
          <Route path="sections" element={
            <SidebarLayout>
              <AdminSectionsPage />
            </SidebarLayout>
          } />
          <Route path="grades" element={
            <SidebarLayout>
              <AdminGradesPage />
            </SidebarLayout>
          } />
          <Route path="subjects" element={
            <SidebarLayout>
              <AdminSubjectsPage />
            </SidebarLayout>
          } />
          <Route path="csv-import" element={
            <SidebarLayout>
              <AdminCSVImportPage />
            </SidebarLayout>
          } />
          <Route path="tier-limits" element={
            <SidebarLayout>
              <AdminTierLimitsPage />
            </SidebarLayout>
          } />
        </Route>
        
        {/* 404 Not Found */}
        <Route path="*" element={
          <SidebarLayout>
            <NotFoundPage />
          </SidebarLayout>
        } />
      </Routes>
    </Suspense>
  );
};
