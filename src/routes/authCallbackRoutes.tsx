
import React from 'react';
import { RouteConfig } from './publicRoutes';
import { EvernoteAuthCallback } from '@/components/auth/EvernoteAuthCallback';
import { NotionAuthCallback } from '@/components/auth/NotionAuthCallback';
import { GoogleDocsAuthCallback } from '@/components/auth/GoogleDocsAuthCallback';
import { MicrosoftAuthCallback } from '@/components/auth/MicrosoftAuthCallback';

// Auth callback routes - these need to be accessible without full authentication
export const authCallbackRoutes: RouteConfig[] = [
  { path: "/auth/evernote/callback", element: <EvernoteAuthCallback /> },
  { path: "/auth/notion/callback", element: <NotionAuthCallback /> },
  { path: "/auth/google-docs/callback", element: <GoogleDocsAuthCallback /> },
  { path: "/auth/microsoft/callback", element: <MicrosoftAuthCallback /> },
];
