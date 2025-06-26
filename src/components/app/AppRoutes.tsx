
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";

import DashboardPage from "@/pages/DashboardPage";
import NotesPage from "@/pages/NotesPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import GoalsPage from "@/pages/GoalsPage";
import TodosPage from "@/pages/TodosPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import FeedbackPage from "@/pages/FeedbackPage";
import ReferralsPage from "@/pages/ReferralsPage";
import LoginPage from "@/pages/LoginPage";
import SettingsPage from "@/pages/SettingsPage";
import PricingPage from "@/pages/PricingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import StudyPlannerPage from '@/pages/StudyPlannerPage';
import StudySessionsPage from '@/pages/StudySessionsPage';
import { useEffect } from "react";

const AppRoutes = () => {
  const { user, loading } = useRequireAuth();

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/notes" element={<NotesPage />} />
        <Route path="/flashcards" element={<FlashcardsPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/todos" element={<TodosPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/referrals" element={<ReferralsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/study-planner" element={<StudyPlannerPage />} />
        <Route path="/study-sessions" element={<StudySessionsPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </>
    )
  );

  return <RouterProvider router={router} />;
};

export default AppRoutes;
