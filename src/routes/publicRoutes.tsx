
import React from 'react';
import { Navigate } from 'react-router-dom';
import Layout from "@/components/layout/Layout";
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

// Public routes (no authentication required) - wrapped with Layout for navbar/footer
export const publicRoutes: RouteConfig[] = [
  { path: "/", element: <HomePage /> }, // HomePage already has Layout internally
  { path: "/about", element: <AboutPage /> }, // AboutPage already has Layout internally  
  { path: "/pricing", element: <PricingPage /> }, // PricingPage already has Layout internally
  { path: "/login", element: <LoginPage /> }, // LoginPage already has Layout internally
  { path: "/signup", element: <Layout><SignUpForm /></Layout> },
  { path: "/contact", element: <ContactPage /> }, // ContactPage already has Layout internally
  { 
    path: "/terms", 
    element: <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <p>Terms of service content coming soon...</p>
      </div>
    </Layout> 
  },
  { 
    path: "/privacy", 
    element: <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <p>Privacy policy content coming soon...</p>
      </div>
    </Layout> 
  },
  { 
    path: "/features", 
    element: <Layout>
      <div className="container mx-auto px-6 py-8">
        <h1 className="text-3xl font-bold mb-6">Features</h1>
        <p>Features page content coming soon...</p>
      </div>
    </Layout> 
  }
];
