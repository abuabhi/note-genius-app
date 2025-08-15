
import React from 'react';
// import SidebarLayout from "@/components/layout/SidebarLayout"; // Not needed - using global SidebarProvider
import AdminDashboardPage from "@/pages/AdminDashboardPage";
import AdminUsersPage from "@/pages/AdminUsersPage";
import AdminFlashcardPage from "@/pages/AdminFlashcardPage";
import AdminSectionsPage from "@/pages/AdminSectionsPage";
import AdminSubjectsPage from "@/pages/AdminSubjectsPage";
import AdminGradesPage from "@/pages/AdminGradesPage";
import AdminCSVImportPage from "@/pages/AdminCSVImportPage";
import AdminAnalyticsPage from "@/pages/AdminAnalyticsPage";
import AdminAnnouncementsPage from "@/pages/AdminAnnouncementsPage";
import AdminTierLimitsPage from "@/pages/AdminTierLimitsPage";
import AdminFeedbackPage from "@/pages/AdminFeedbackPage";
import AdminFeedbackSettingsPage from "@/pages/AdminFeedbackSettingsPage";
import AdminSystemMonitoringPage from "@/pages/AdminSystemMonitoringPage";
import AdminContactSubmissionsPage from "@/pages/AdminContactSubmissionsPage";
import AdminHelpManagementPage from "@/pages/AdminHelpManagementPage";
import AdminInfluencersPage from "@/pages/AdminInfluencersPage";
import AdminCouponsPage from "@/pages/AdminCouponsPage";
import AdminPayoutsPage from "@/pages/AdminPayoutsPage";
import AdminTranscriptionsPage from "@/pages/AdminTranscriptionsPage";
import AdminMusicPage from "@/pages/AdminMusicPage";
import { RouteConfig } from './publicRoutes';

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
  { path: "/admin/announcements", element: <AdminAnnouncementsPage /> },
  { path: "/admin/flashcards", element: <AdminFlashcardPage /> },
  { path: "/admin/sections", element: <AdminSectionsPage /> },
  { path: "/admin/grades", element: <AdminGradesPage /> },
  { path: "/admin/subjects", element: <AdminSubjectsPage /> },
  { path: "/admin/csv-import", element: <AdminCSVImportPage /> },
  { path: "/admin/tier-limits", element: <AdminTierLimitsPage /> },
  { path: "/admin/help", element: <AdminHelpManagementPage /> },
  { path: "/admin/coupons", element: <AdminCouponsPage /> },
  { path: "/admin/payouts", element: <AdminPayoutsPage /> },
  { path: "/admin/music", element: <AdminMusicPage /> },
];
