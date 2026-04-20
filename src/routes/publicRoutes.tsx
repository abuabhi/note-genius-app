
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import PricingPage from "@/pages/PricingPage";
import LoginPage from "@/pages/LoginPage";
import ContactPage from "@/pages/ContactPage";
import FeaturesPage from "@/pages/FeaturesPage";
import TermsPage from "@/pages/TermsPage";
import PrivacyPage from "@/pages/PrivacyPage";
import PublicCouponPage from "@/pages/PublicCouponPage";
import TierSelectionPage from "@/pages/TierSelectionPage";
import PaymentPage from "@/pages/PaymentPage";
import SignupPage from "@/pages/SignupPage";
import HelpRedirectPage from "@/pages/HelpRedirectPage";
import FAQPage from "@/pages/FAQPage";
import SiteMapPage from "@/pages/SiteMapPage";
import AIFlashcardsPage from "@/pages/features/AIFlashcardsPage";
import StudyPlannerPage from "@/pages/features/StudyPlannerPage";
import QuizGeneratorPage from "@/pages/features/QuizGeneratorPage";
import StudyAnalyticsPage from "@/pages/features/StudyAnalyticsPage";

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
}

// Public routes (no authentication required) - wrapped with Layout for navbar/footer
export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <HomePage /> }, // HomePage already has Layout internally
  { path: "/about", element: <AboutPage /> }, // AboutPage already has Layout internally  
  { path: "/pricing", element: <PricingPage /> }, // PricingPage already has Layout internally
  { path: "/login", element: <LoginPage /> }, // LoginPage already has Layout internally
  { path: "/signup", element: <SignupPage /> },
  { path: "/tier-selection", element: <TierSelectionPage /> },
  { path: "/payment", element: <PaymentPage /> },
  { path: "/contact", element: <ContactPage /> }, // ContactPage already has Layout internally
  { path: "/terms", element: <TermsPage /> }, // TermsPage already has Layout internally
  { path: "/privacy", element: <PrivacyPage /> }, // PrivacyPage already has Layout internally
  { path: "/features", element: <FeaturesPage /> }, // FeaturesPage already has Layout internally
  { path: "/help", element: <HelpRedirectPage /> },
  { path: "/help-center", element: <Navigate to="/help" replace /> },
  { path: "/help-centre", element: <Navigate to="/help" replace /> },
  { path: "/faq", element: <FAQPage /> },
  { path: "/sitemap", element: <SiteMapPage /> },
  { path: "/coupon/:code", element: <PublicCouponPage /> }, // Public coupon redemption page
  
  // Feature landing pages
  { path: "/features/ai-flashcards", element: <AIFlashcardsPage /> },
  { path: "/features/study-planner", element: <StudyPlannerPage /> },
  { path: "/features/quiz-generator", element: <QuizGeneratorPage /> },
  { path: "/features/study-analytics", element: <StudyAnalyticsPage /> }
];
