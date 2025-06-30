
import React from 'react';
import { Navigate } from 'react-router-dom';
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import PricingPage from "@/pages/PricingPage";
import LoginPage from "@/pages/LoginPage";
import HelpPage from "@/pages/HelpPage";
import ContactPage from "@/pages/ContactPage";
import FeedbackPage from "@/pages/FeedbackPage";
import ReferralsPage from "@/pages/ReferralsPage";
import FAQPage from "@/pages/FAQPage";
import { SignUpForm } from "@/components/auth/SignUpForm";

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
}

// Public routes (no authentication required)
export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <HomePage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpForm /> },
  { path: "/help", element: <HelpPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/feedback", element: <FeedbackPage /> },
  { path: "/referrals", element: <ReferralsPage /> },
  { path: "/faq", element: <FAQPage /> },
];
