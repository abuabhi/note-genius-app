
import React from 'react';
import SidebarLayout from "@/components/layout/SidebarLayout";
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
import { RouteConfig } from './publicRoutes';

// Admin routes - wrapped with SidebarLayout for sidebar/header
export const adminRoutes: RouteConfig[] = [
  { path: "/admin", element: <SidebarLayout><AdminDashboardPage /></SidebarLayout> },
  { path: "/admin/system-monitoring", element: <SidebarLayout><AdminSystemMonitoringPage /></SidebarLayout> },
  { path: "/admin/users", element: <SidebarLayout><AdminUsersPage /></SidebarLayout> },
  { path: "/admin/influencers", element: <SidebarLayout><AdminInfluencersPage /></SidebarLayout> },
  { path: "/admin/contact-submissions", element: <SidebarLayout><AdminContactSubmissionsPage /></SidebarLayout> },
  { path: "/admin/feedback", element: <SidebarLayout><AdminFeedbackPage /></SidebarLayout> },
  { path: "/admin/feedback/settings", element: <SidebarLayout><AdminFeedbackSettingsPage /></SidebarLayout> },
  { path: "/admin/analytics", element: <SidebarLayout><AdminAnalyticsPage /></SidebarLayout> },
  { path: "/admin/announcements", element: <SidebarLayout><AdminAnnouncementsPage /></SidebarLayout> },
  { path: "/admin/flashcards", element: <SidebarLayout><AdminFlashcardPage /></SidebarLayout> },
  { path: "/admin/sections", element: <SidebarLayout><AdminSectionsPage /></SidebarLayout> },
  { path: "/admin/grades", element: <SidebarLayout><AdminGradesPage /></SidebarLayout> },
  { path: "/admin/subjects", element: <SidebarLayout><AdminSubjectsPage /></SidebarLayout> },
  { path: "/admin/csv-import", element: <SidebarLayout><AdminCSVImportPage /></SidebarLayout> },
  { path: "/admin/tier-limits", element: <SidebarLayout><AdminTierLimitsPage /></SidebarLayout> },
  { path: "/admin/help", element: <SidebarLayout><AdminHelpManagementPage /></SidebarLayout> },
];
