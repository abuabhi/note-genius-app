import React, { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * GoogleDocsAuthCallback Component
 * 
 * This component handles the OAuth 2.0 callback from Google's authorization server.
 * It processes the authorization code and redirects back to the import page with
 * the result.
 * 
 * Simplified Flow:
 * 1. Extract authorization code or error from URL parameters
 * 2. Exchange code for tokens via edge function
 * 3. Redirect to import page with success/error status
 */

export const GoogleDocsAuthCallback = () => {
  const [message, setMessage] = useState('Processing authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 [GOOGLE DOCS CALLBACK] Processing OAuth callback...');
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      console.log('🔄 [GOOGLE DOCS CALLBACK] URL params:', { code: !!code, error, errorDescription });
      
      if (error) {
        // Redirect back to import page with error
        const redirectUrl = `/import/google-docs?error=${encodeURIComponent(errorDescription || error)}`;
        console.log('❌ [GOOGLE DOCS CALLBACK] Redirecting with error:', redirectUrl);
        window.location.href = redirectUrl;
        return;
      }
      
      if (code) {
        try {
          console.log('🔄 [GOOGLE DOCS CALLBACK] Processing authorization code...');
          
          // Exchange code for tokens via edge function
          const { data, error: exchangeError } = await supabase.functions.invoke('googledocs-auth', {
            body: {
              code,
              redirect_uri: `${window.location.origin}/auth/google-docs/callback`,
              grant_type: 'authorization_code'
            }
          });
          
          if (exchangeError) {
            throw exchangeError;
          }
          
          console.log('✅ [GOOGLE DOCS CALLBACK] Token exchange successful');
          
          // Store tokens securely (you might want to use HTTP-only cookies in production)
          sessionStorage.setItem('google_access_token', data.access_token);
          if (data.refresh_token) {
            sessionStorage.setItem('google_refresh_token', data.refresh_token);
          }
          
          // Redirect back to import page with success
          const redirectUrl = `/import/google-docs?success=true`;
          console.log('✅ [GOOGLE DOCS CALLBACK] Redirecting with success:', redirectUrl);
          window.location.href = redirectUrl;
          
        } catch (error) {
          console.error('❌ [GOOGLE DOCS CALLBACK] Token exchange failed:', error);
          const redirectUrl = `/import/google-docs?error=${encodeURIComponent('Failed to complete authorization')}`;
          window.location.href = redirectUrl;
        }
      } else {
        // No code or error, redirect with generic error
        const redirectUrl = `/import/google-docs?error=${encodeURIComponent('Authorization failed')}`;
        console.log('❌ [GOOGLE DOCS CALLBACK] No code received, redirecting:', redirectUrl);
        window.location.href = redirectUrl;
      }
    };
    
    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};