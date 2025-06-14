
import React from 'react';
import NotionAuthCallback from '@/components/auth/NotionAuthCallback';
import EvernoteAuthCallback from '@/components/auth/EvernoteAuthCallback';
import MicrosoftAuthCallback from '@/components/auth/MicrosoftAuthCallback';
import GoogleDocsAuthCallback from '@/components/auth/GoogleDocsAuthCallback';
import { RouteConfig } from './publicRoutes';

// Auth callback routes
export const authCallbackRoutes: RouteConfig[] = [
  { path: "/auth/notion/callback", element: <NotionAuthCallback /> },
  { path: "/auth/evernote/callback", element: <EvernoteAuthCallback /> },
  { path: "/auth/microsoft-callback", element: <MicrosoftAuthCallback /> },
  { path: "/oauth2callback", element: <GoogleDocsAuthCallback /> },
];
