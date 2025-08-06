import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export const MicrosoftCallbackHandler = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('📨 [MICROSOFT CALLBACK] Received OAuth callback', { 
      code: code ? 'present' : 'missing', 
      state, 
      error, 
      errorDescription 
    });

    if (error) {
      console.error('❌ [MICROSOFT CALLBACK] OAuth error:', error, errorDescription);
      
      // Store error in localStorage for the auth service to pick up
      localStorage.setItem('onenote_auth_pending', JSON.stringify({
        error: errorDescription || error || 'Authentication failed'
      }));
      
      // Also send postMessage to parent window
      if (window.opener) {
        window.opener.postMessage({
          type: 'microsoft_oauth_callback',
          error: errorDescription || error || 'Authentication failed'
        }, window.location.origin);
      }
      
      window.close();
      return;
    }

    if (code) {
      console.log('✅ [MICROSOFT CALLBACK] Authorization code received, storing for auth service');
      
      // Store the auth result for the auth service to pick up
      const authResult = { code, state };
      localStorage.setItem('onenote_auth_pending', JSON.stringify(authResult));
      
      // Also send postMessage to parent window for immediate processing
      if (window.opener) {
        console.log('📤 [MICROSOFT CALLBACK] Sending message to parent window');
        window.opener.postMessage({
          type: 'microsoft_oauth_callback',
          code,
          state
        }, window.location.origin);
      }
      
      // Close the popup
      window.close();
    } else {
      console.error('❌ [MICROSOFT CALLBACK] No authorization code received');
      
      // Store error
      localStorage.setItem('onenote_auth_pending', JSON.stringify({
        error: 'No authorization code received'
      }));
      
      if (window.opener) {
        window.opener.postMessage({
          type: 'microsoft_oauth_callback',
          error: 'No authorization code received'
        }, window.location.origin);
      }
      
      window.close();
    }
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p>Processing Microsoft authentication...</p>
      </div>
    </div>
  );
};