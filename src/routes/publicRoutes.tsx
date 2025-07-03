
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
import { SignUpForm } from "@/components/auth/SignUpForm";

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
  { path: "/signup", element: <Layout><SignUpForm /></Layout> },
  { path: "/contact", element: <ContactPage /> }, // ContactPage already has Layout internally
  { path: "/terms", element: <TermsPage /> }, // TermsPage already has Layout internally
  { path: "/privacy", element: <PrivacyPage /> }, // PrivacyPage already has Layout internally
  { path: "/features", element: <FeaturesPage /> }, // FeaturesPage already has Layout internally
  { path: "/coupon/:code", element: <PublicCouponPage /> } // Public coupon redemption page
];
