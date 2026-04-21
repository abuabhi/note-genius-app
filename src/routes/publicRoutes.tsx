
import React, { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import HomePage from "@/pages/HomePage"; // eager: this IS the landing page
import LoginPage from "@/pages/LoginPage"; // eager: critical auth path

// Lazy-load every other public page so they don't bloat the landing bundle.
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const PricingPage = lazy(() => import("@/pages/PricingPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const FeaturesPage = lazy(() => import("@/pages/FeaturesPage"));
const TermsPage = lazy(() => import("@/pages/TermsPage"));
const PrivacyPage = lazy(() => import("@/pages/PrivacyPage"));
const PublicCouponPage = lazy(() => import("@/pages/PublicCouponPage"));
const TierSelectionPage = lazy(() => import("@/pages/TierSelectionPage"));
const PaymentPage = lazy(() => import("@/pages/PaymentPage"));
const SignupPage = lazy(() => import("@/pages/SignupPage"));
const HelpRedirectPage = lazy(() => import("@/pages/HelpRedirectPage"));
const FAQPage = lazy(() => import("@/pages/FAQPage"));
const SiteMapPage = lazy(() => import("@/pages/SiteMapPage"));
const AIFlashcardsPage = lazy(() => import("@/pages/features/AIFlashcardsPage"));
const StudyPlannerPage = lazy(() => import("@/pages/features/StudyPlannerPage"));
const QuizGeneratorPage = lazy(() => import("@/pages/features/QuizGeneratorPage"));
const StudyAnalyticsPage = lazy(() => import("@/pages/features/StudyAnalyticsPage"));

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
}

// Public routes (no authentication required) - wrapped with Layout for navbar/footer
export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <HomePage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/tier-selection", element: <TierSelectionPage /> },
  { path: "/payment", element: <PaymentPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/terms", element: <TermsPage /> },
  { path: "/privacy", element: <PrivacyPage /> },
  { path: "/features", element: <FeaturesPage /> },
  { path: "/help", element: <HelpRedirectPage /> },
  { path: "/help-center", element: <Navigate to="/help" replace /> },
  { path: "/help-centre", element: <Navigate to="/help" replace /> },
  { path: "/faq", element: <FAQPage /> },
  { path: "/sitemap", element: <SiteMapPage /> },
  { path: "/coupon/:code", element: <PublicCouponPage /> },

  // Feature landing pages
  { path: "/features/ai-flashcards", element: <AIFlashcardsPage /> },
  { path: "/features/study-planner", element: <StudyPlannerPage /> },
  { path: "/features/quiz-generator", element: <QuizGeneratorPage /> },
  { path: "/features/study-analytics", element: <StudyAnalyticsPage /> },
];
