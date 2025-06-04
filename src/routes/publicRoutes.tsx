
import React from 'react';
import HomePage from "@/pages/HomePage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import AboutPage from "@/pages/AboutPage";
import ContactPage from "@/pages/ContactPage";
import PricingPage from "@/pages/PricingPage";
import FAQPage from "@/pages/FAQPage";

export interface RouteConfig {
  path: string;
  element: React.ReactElement;
}

// Public routes that don't require authentication
export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <HomePage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/pricing", element: <PricingPage /> },
  { path: "/faq", element: <FAQPage /> },
];
