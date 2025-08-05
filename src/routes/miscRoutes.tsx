
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
import NotFoundPage from "@/pages/NotFoundPage";
import OnboardingPage from "@/pages/OnboardingPage";
import TestEnhancementPage from "@/pages/TestEnhancementPage";
import GoogleDocsTestPage from "@/pages/GoogleDocsTestPage";
import { RouteConfig } from './publicRoutes';

// Miscellaneous routes
export const miscRoutes: RouteConfig[] = [
  { path: "/onboarding", element: <OnboardingPage /> }, // OnboardingPage already has Layout internally
  { path: "/test-enhancement", element: <TestEnhancementPage /> },
  { path: "/google-docs-test", element: <Layout><GoogleDocsTestPage /></Layout> },
  { path: "*", element: <NotFoundPage /> } // NotFoundPage already has Layout internally
];
