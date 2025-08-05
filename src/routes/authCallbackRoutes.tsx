
import React from 'react';
import { RouteConfig } from './publicRoutes';
import { EvernoteAuthCallback } from '@/components/auth/EvernoteAuthCallback';
import { NotionAuthCallback } from '@/components/auth/NotionAuthCallback';
import { GoogleDocsAuthCallback } from '@/components/auth/GoogleDocsAuthCallback';
import { MicrosoftAuthCallback } from '@/components/auth/MicrosoftAuthCallback';
import { AuthCallbackErrorBoundary } from '@/components/auth/AuthCallbackErrorBoundary';

// Wrapper component for debug logging
const RouteDebugWrapper = ({ children, routeName }: { children: React.ReactNode; routeName: string }) => {
  React.useEffect(() => {
    const mountTime = Date.now();
    console.log(`🛣️ [ROUTE DEBUG] ${routeName} component mounted at ${mountTime}`);
    console.log(`🛣️ [ROUTE DEBUG] Current URL: ${window.location.href}`);
    console.log(`🛣️ [ROUTE DEBUG] Search params:`, Object.fromEntries(new URLSearchParams(window.location.search)));
    console.log(`🛣️ [ROUTE DEBUG] Hash params:`, window.location.hash);
    console.log(`🛣️ [ROUTE DEBUG] Document ready state:`, document.readyState);
    console.log(`🛣️ [ROUTE DEBUG] Window properties:`, {
      hasOpener: !!window.opener,
      openerClosed: window.opener?.closed,
      screenX: window.screenX,
      screenY: window.screenY,
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight
    });
    
    return () => {
      const unmountTime = Date.now();
      const lifespan = unmountTime - mountTime;
      console.log(`🛣️ [ROUTE DEBUG] ${routeName} component unmounting after ${lifespan}ms`);
    };
  }, [routeName]);
  
  return <>{children}</>;
};

// Auth callback routes - these need to be accessible without full authentication
export const authCallbackRoutes: RouteConfig[] = [
  { 
    path: "/auth/evernote/callback", 
    element: (
      <AuthCallbackErrorBoundary>
        <RouteDebugWrapper routeName="Evernote Auth Callback">
          <EvernoteAuthCallback />
        </RouteDebugWrapper>
      </AuthCallbackErrorBoundary>
    )
  },
  { 
    path: "/auth/notion/callback", 
    element: (
      <AuthCallbackErrorBoundary>
        <RouteDebugWrapper routeName="Notion Auth Callback">
          <NotionAuthCallback />
        </RouteDebugWrapper>
      </AuthCallbackErrorBoundary>
    )
  },
  { 
    path: "/auth/google-docs/callback", 
    element: (
      <AuthCallbackErrorBoundary>
        <RouteDebugWrapper routeName="Google Docs Auth Callback">
          <GoogleDocsAuthCallback />
        </RouteDebugWrapper>
      </AuthCallbackErrorBoundary>
    )
  },
  { 
    path: "/auth/microsoft/callback", 
    element: (
      <AuthCallbackErrorBoundary>
        <RouteDebugWrapper routeName="Microsoft Auth Callback">
          <MicrosoftAuthCallback />
        </RouteDebugWrapper>
      </AuthCallbackErrorBoundary>
    )
  },
  { 
    path: "/oauth2callback", 
    element: (
      <AuthCallbackErrorBoundary>
        <RouteDebugWrapper routeName="Google OAuth2 Callback">
          <GoogleDocsAuthCallback />
        </RouteDebugWrapper>
      </AuthCallbackErrorBoundary>
    )
  },
];
