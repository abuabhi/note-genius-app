import React, { useEffect, useState } from 'react';
import { useManagedTimeout } from '@/utils/performance';

// Immediate file load verification
console.log('🚀 [GOOGLE DOCS CALLBACK] Component file loaded at:', new Date().toISOString());
console.log('🚀 [GOOGLE DOCS CALLBACK] Current URL at file load:', window.location.href);
console.log('🚀 [GOOGLE DOCS CALLBACK] Window properties at file load:', {
  origin: window.location.origin,
  hasOpener: !!window.opener,
  openerClosed: window.opener?.closed,
  referrer: document.referrer
});

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
  console.log('🎯 [GOOGLE DOCS CALLBACK] Component function called');
  const [message, setMessage] = useState('Processing authorization...');
  const [shouldAutoClose, setShouldAutoClose] = useState(false);

  // Managed timeout for auto-closing
  useManagedTimeout('google-docs-auto-close', () => {
    console.log('🔚 [GOOGLE DOCS CALLBACK] Auto-closing popup');
    window.close();
  }, shouldAutoClose ? 2000 : null);

  useEffect(() => {
    const handleCallback = async () => {
      console.log('🔄 [GOOGLE DOCS CALLBACK] OAuth callback component mounted');
      console.log('🔄 [GOOGLE DOCS CALLBACK] Current URL:', window.location.href);
      console.log('🔄 [GOOGLE DOCS CALLBACK] Window properties:', {
        origin: window.location.origin,
        hasOpener: !!window.opener,
        referrer: document.referrer
      });
      console.log('🔄 [GOOGLE DOCS CALLBACK] Processing OAuth callback...');
      
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');
      const state = urlParams.get('state');
      
      console.log('🔄 [GOOGLE DOCS CALLBACK] URL params:', { 
        code: !!code, 
        error, 
        errorDescription,
        state,
        fullParams: Object.fromEntries(urlParams)
      });
      
      if (error) {
        console.log('❌ [GOOGLE DOCS CALLBACK] OAuth error:', errorDescription || error);
        
        // Store error for parent window in localStorage for better persistence
        localStorage.setItem('googledocs_auth_pending', JSON.stringify({
          error: errorDescription || error || 'Authentication failed',
          timestamp: Date.now()
        }));
        
        // Post message to parent window with enhanced error handling
        if (window.opener && !window.opener.closed) {
          try {
            console.log('📤 [GOOGLE DOCS CALLBACK] Posting error message to parent');
            window.opener.postMessage({
              type: 'googledocs_oauth_callback',
              error: errorDescription || error,
              timestamp: Date.now()
            }, window.location.origin);
            console.log('✅ [GOOGLE DOCS CALLBACK] Error message posted successfully');
          } catch (postError) {
            console.error('❌ [GOOGLE DOCS CALLBACK] Failed to post error message:', postError);
          }
        } else {
          console.warn('⚠️ [GOOGLE DOCS CALLBACK] No valid opener window for error posting');
        }
        
        setMessage('Authentication failed. Please wait...');
        
        // Auto-close after posting error message
        setShouldAutoClose(true);
        return;
      }
      
      if (code) {
        console.log('✅ [GOOGLE DOCS CALLBACK] Authorization code received');
        
        // Store auth result for the main window in localStorage
        localStorage.setItem('googledocs_auth_pending', JSON.stringify({
          code,
          state: urlParams.get('state'),
          timestamp: Date.now()
        }));
        
        // Post message to parent window with enhanced success handling
        if (window.opener && !window.opener.closed) {
          try {
            console.log('📤 [GOOGLE DOCS CALLBACK] Posting success message to parent');
            
            // Try multiple postMessage attempts with different origins
            const origins = [window.location.origin, '*'];
            for (const origin of origins) {
              try {
                window.opener.postMessage({
                  type: 'googledocs_oauth_callback',
                  code,
                  state: urlParams.get('state'),
                  timestamp: Date.now()
                }, origin);
                console.log(`✅ [GOOGLE DOCS CALLBACK] Success message posted with origin: ${origin}`);
              } catch (originError) {
                console.warn(`⚠️ [GOOGLE DOCS CALLBACK] Failed to post with origin ${origin}:`, originError);
              }
            }
            
            // Additional retry mechanism
            useManagedTimeout('google-docs-retry', () => {
              if (window.opener && !window.opener.closed) {
                try {
                  window.opener.postMessage({
                    type: 'googledocs_oauth_callback',
                    code,
                    state: urlParams.get('state'),
                    timestamp: Date.now(),
                    retry: true
                  }, window.location.origin);
                  console.log('🔄 [GOOGLE DOCS CALLBACK] Retry message posted successfully');
                } catch (retryError) {
                  console.error('❌ [GOOGLE DOCS CALLBACK] Retry message failed:', retryError);
                }
              }
            }, 500);
            
          } catch (postError) {
            console.error('❌ [GOOGLE DOCS CALLBACK] Failed to post success message:', postError);
          }
        } else {
          console.warn('⚠️ [GOOGLE DOCS CALLBACK] No valid opener window for success posting');
        }
        
        setMessage('Authorization successful! Please wait...');
        
        // Auto-close after posting success message  
        useManagedTimeout('google-docs-success-close', () => {
          console.log('🔚 [GOOGLE DOCS CALLBACK] Auto-closing popup after success');
          window.close();
        }, 1500);
      } else {
        console.log('❌ [GOOGLE DOCS CALLBACK] No code or error received');
        
        // Store error for parent window in localStorage
        localStorage.setItem('googledocs_auth_pending', JSON.stringify({
          error: 'Authorization failed - no code received',
          timestamp: Date.now()
        }));
        
        // Post message to parent window for no-code scenario
        if (window.opener && !window.opener.closed) {
          try {
            console.log('📤 [GOOGLE DOCS CALLBACK] Posting no-code error to parent');
            window.opener.postMessage({
              type: 'googledocs_oauth_callback',
              error: 'Authorization failed - no code received',
              timestamp: Date.now()
            }, window.location.origin);
            console.log('✅ [GOOGLE DOCS CALLBACK] No-code error posted successfully');
          } catch (postError) {
            console.error('❌ [GOOGLE DOCS CALLBACK] Failed to post no-code error:', postError);
          }
        } else {
          console.warn('⚠️ [GOOGLE DOCS CALLBACK] No valid opener window for no-code error posting');
        }
        
        setMessage('Authorization failed. Please wait...');
        
        // Auto-close after posting no-code error
        setShouldAutoClose(true);
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