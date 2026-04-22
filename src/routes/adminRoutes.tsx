
import React, { lazy } from 'react';
import { RouteConfig } from './publicRoutes';

// Lazy load every admin page so their heavy deps (recharts, tiptap, etc.)
// only download when an admin actually visits the page.
const AdminDashboardPage = lazy(() => import("@/pages/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("@/pages/AdminUsersPage"));
const AdminFlashcardPage = lazy(() => import("@/pages/AdminFlashcardPage"));
const AdminSectionsPage = lazy(() => import("@/pages/AdminSectionsPage"));
const AdminSubjectsPage = lazy(() => import("@/pages/AdminSubjectsPage"));
const AdminGradesPage = lazy(() => import("@/pages/AdminGradesPage"));
const AdminCSVImportPage = lazy(() => import("@/pages/AdminCSVImportPage"));
const AdminAnalyticsPage = lazy(() => import("@/pages/AdminAnalyticsPage"));
const AdminAnnouncementsPage = lazy(() => import("@/pages/AdminAnnouncementsPage"));
const AdminTierLimitsPage = lazy(() => import("@/pages/AdminTierLimitsPage"));
const AdminFeedbackPage = lazy(() => import("@/pages/AdminFeedbackPage"));
const AdminFeedbackSettingsPage = lazy(() => import("@/pages/AdminFeedbackSettingsPage"));
const AdminSystemMonitoringPage = lazy(() => import("@/pages/AdminSystemMonitoringPage"));
const AdminContactSubmissionsPage = lazy(() => import("@/pages/AdminContactSubmissionsPage"));
const AdminInfluencersPage = lazy(() => import("@/pages/AdminInfluencersPage"));
const AdminCouponsPage = lazy(() => import("@/pages/AdminCouponsPage"));
const AdminPayoutsPage = lazy(() => import("@/pages/AdminPayoutsPage"));
const AdminTranscriptionsPage = lazy(() => import("@/pages/AdminTranscriptionsPage"));
const AdminVideoManagementPage = lazy(() => import("@/pages/AdminVideoManagementPage"));
const AdminBlogPage = lazy(() => import("@/pages/AdminBlogPage"));
const AdminBlogEditorPage = lazy(() => import("@/pages/AdminBlogEditorPage"));
const AdminBlogAIGeneratorPage = lazy(() => import("@/pages/AdminBlogAIGeneratorPage"));
const BlogCampaignsPage = lazy(() => import("@/pages/BlogCampaignsPage"));
const AdminStripeWebhookChecklistPage = lazy(() => import("@/pages/AdminStripeWebhookChecklistPage"));

// Admin routes - wrapped with SidebarLayout for sidebar/header
export const adminRoutes: RouteConfig[] = [
  { path: "/admin", element: <AdminDashboardPage /> },
  { path: "/admin/system-monitoring", element: <AdminSystemMonitoringPage /> },
  { path: "/admin/users", element: <AdminUsersPage /> },
  { path: "/admin/influencers", element: <AdminInfluencersPage /> },
  { path: "/admin/contact-submissions", element: <AdminContactSubmissionsPage /> },
  { path: "/admin/feedback", element: <AdminFeedbackPage /> },
  { path: "/admin/feedback/settings", element: <AdminFeedbackSettingsPage /> },
  { path: "/admin/analytics", element: <AdminAnalyticsPage /> },
  { path: "/admin/transcriptions", element: <AdminTranscriptionsPage /> },
  { path: "/admin/video-management", element: <AdminVideoManagementPage /> },
  { path: "/admin/announcements", element: <AdminAnnouncementsPage /> },
  { path: "/admin/flashcards", element: <AdminFlashcardPage /> },
  { path: "/admin/sections", element: <AdminSectionsPage /> },
  { path: "/admin/grades", element: <AdminGradesPage /> },
  { path: "/admin/subjects", element: <AdminSubjectsPage /> },
  { path: "/admin/csv-import", element: <AdminCSVImportPage /> },
  { path: "/admin/tier-limits", element: <AdminTierLimitsPage /> },
  { path: "/admin/coupons", element: <AdminCouponsPage /> },
  { path: "/admin/payouts", element: <AdminPayoutsPage /> },
  { path: "/admin/blog", element: <AdminBlogPage /> },
  { path: "/admin/blog/new", element: <AdminBlogEditorPage /> },
  { path: "/admin/blog/edit/:id", element: <AdminBlogEditorPage /> },
  { path: "/admin/blog/ai-generate", element: <AdminBlogAIGeneratorPage /> },
  { path: "/admin/blog/campaigns", element: <BlogCampaignsPage /> },
  { path: "/admin/stripe-webhook-checklist", element: <AdminStripeWebhookChecklistPage /> },
];
