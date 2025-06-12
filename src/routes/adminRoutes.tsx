
import React from 'react';
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
import { RouteConfig } from './publicRoutes';

// Admin routes
export const adminRoutes: RouteConfig[] = [
  { path: "/admin", element: <AdminDashboardPage /> }, // Main admin dashboard
  { path: "/admin/system-monitoring", element: <AdminSystemMonitoringPage /> },
  { path: "/admin/users", element: <AdminUsersPage /> },
  { path: "/admin/feedback", element: <AdminFeedbackPage /> },
  { path: "/admin/feedback/settings", element: <AdminFeedbackSettingsPage /> },
  { path: "/admin/analytics", element: <AdminAnalyticsPage /> },
  { path: "/admin/announcements", element: <AdminAnnouncementsPage /> },
  { path: "/admin/flashcards", element: <AdminFlashcardPage /> },
  { path: "/admin/sections", element: <AdminSectionsPage /> },
  { path: "/admin/grades", element: <AdminGradesPage /> },
  { path: "/admin/subjects", element: <AdminSubjectsPage /> },
  { path: "/admin/csv-import", element: <AdminCSVImportPage /> },
  { path: "/admin/tier-limits", element: <AdminTierLimitsPage /> },
];
