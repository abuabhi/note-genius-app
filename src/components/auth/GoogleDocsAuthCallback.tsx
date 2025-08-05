import React, { useEffect, useState } from 'react';

/**
 * GoogleDocsAuthCallback Component
 * 
 * This component handles the OAuth 2.0 callback from Google's authorization server.
 * It processes the authorization code and communicates back to the parent window
 * to maintain the modal dialog workflow.
 * 
 * Modal-Friendly Flow:
 * 1. Extract authorization code or error from URL parameters
 * 2. Store result in sessionStorage for parent window to process
 * 3. Post message to parent window and close popup
 * 
 * This component is isolated and should NEVER show main app content.
 */

export const GoogleDocsAuthCallback = () => {
  const [message, setMessage] = useState('Processing authorization...');

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 [GOOGLE DOCS CALLBACK] OAuth callback component mounted');
      console.log('🔄 [GOOGLE DOCS CALLBACK] Current URL:', window.location.href);
      console.log('🔄 [GOOGLE DOCS CALLBACK] Processing OAuth callback...');
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      
      console.log('🔄 [GOOGLE DOCS CALLBACK] URL params:', { code: !!code, error, errorDescription });
      
      if (error) {
        console.log('❌ [GOOGLE DOCS CALLBACK] OAuth error:', errorDescription || error);
        
        // Store error for parent window
        sessionStorage.setItem('googleDocs_auth_result', JSON.stringify({
          error: errorDescription || error || 'Authentication failed'
        }));
        
        // Post message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'googledocs_oauth_callback',
            error: errorDescription || error
          }, window.location.origin);
        }
        
        setMessage('Authentication failed. You can close this window.');
        setTimeout(() => window.close(), 2000);
        return;
      }
      
      if (code) {
        console.log('✅ [GOOGLE DOCS CALLBACK] Authorization code received');
        
        // Store auth result for the main window
        sessionStorage.setItem('googleDocs_auth_result', JSON.stringify({
          code,
          state: urlParams.get('state')
        }));
        
        // Post message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'googledocs_oauth_callback',
            code,
            state: urlParams.get('state')
          }, window.location.origin);
        }
        
        setMessage('Authorization successful! You can close this window.');
        setTimeout(() => window.close(), 2000);
      } else {
        console.log('❌ [GOOGLE DOCS CALLBACK] No code or error received');
        
        // Store error for parent window
        sessionStorage.setItem('googleDocs_auth_result', JSON.stringify({
          error: 'Authorization failed - no code received'
        }));
        
        // Post message to parent window
        if (window.opener) {
          window.opener.postMessage({
            type: 'googledocs_oauth_callback',
            error: 'Authorization failed - no code received'
          }, window.location.origin);
        }
        
        setMessage('Authorization failed. You can close this window.');
        setTimeout(() => window.close(), 2000);
      }
    };
    
    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm">{message}</p>
        <p className="text-gray-400 text-xs mt-2">Google Docs Authentication</p>
      </div>
    </div>
  );
};