import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import { useBoundStore } from "@/stores/useBoundStore";

import DashboardPage from "@/pages/DashboardPage";
import NotesPage from "@/pages/NotesPage";
import FlashcardsPage from "@/pages/FlashcardsPage";
import QuizzesPage from "@/pages/QuizzesPage";
import GoalsPage from "@/pages/GoalsPage";
import TodosPage from "@/pages/TodosPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import FeedbackPage from "@/pages/FeedbackPage";
import ReferralsPage from "@/pages/ReferralsPage";
import LoginPage from "@/pages/LoginPage";
import RegistrationPage from "@/pages/RegistrationPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import PricingPage from "@/pages/PricingPage";
import NotFoundPage from "@/pages/NotFoundPage";
import PublicLayout from "@/layouts/PublicLayout";
import MainLayout from "@/layouts/MainLayout";
import AuthLayout from "@/layouts/AuthLayout";
import { useEffect } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Shell } from "@/components/Shell";
import StudyPlannerPage from '@/pages/StudyPlannerPage';
import StudySessionsPage from '@/pages/StudySessionsPage';

const AppRoutes = () => {
  const isAuthenticated = useBoundStore((state) => state.isAuthenticated);
  const initialize = useBoundStore((state) => state.initialize);
  const { loading } = useRequireAuth();

  useEffect(() => {
    initialize();
  }, [initialize]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<Shell />}>
          <Route element={<MainLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/flashcards" element={<FlashcardsPage />} />
            <Route path="/quizzes" element={<QuizzesPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/todos" element={<TodosPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/referrals" element={<ReferralsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/study-planner" element={<StudyPlannerPage />} />
            <Route path="/study-sessions" element={<StudySessionsPage />} />
          </Route>

          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
          </Route>
        </Route>

        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </>
    )
  );

  return <RouterProvider router={router} />;
};

export default AppRoutes;
