
import React from 'react';
import { Navigate } from 'react-router-dom';
import HomePage from "@/pages/HomePage";
import AboutPage from "@/pages/AboutPage";
import PricingPage from "@/pages/PricingPage";
import LoginPage from "@/pages/LoginPage";
import ContactPage from "@/pages/ContactPage";
import { SignUpForm } from "@/components/auth/SignUpForm";

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
}

// Public routes (no authentication required) - only truly public pages
export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <HomePage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignUpForm /> },
  { path: "/contact", element: <ContactPage /> },
];
