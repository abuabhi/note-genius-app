
import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Configuration for Google OAuth
const REDIRECT_URI = `${window.location.origin}/oauth2callback`;
// Updated scopes to ensure we have proper access to Google Drive and Docs
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';

export interface GoogleDocsAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  userName: string | null;
  loading: boolean;
  error: string | null;
}

export const useGoogleDocsAuth = () => {
  const [authState, setAuthState] = useState<GoogleDocsAuthState>({
    isAuthenticated: false,
    accessToken: null,
    userName: null,
    loading: false,
    error: null
  });

  // Helper functions
  const clearStoredTokens = useCallback(() => {
    localStorage.removeItem('googleDocs_access_token');
    localStorage.removeItem('googleDocs_user_name');
    localStorage.removeItem('googleDocs_expires_at');
    localStorage.removeItem('googleDocs_refresh_token');
    sessionStorage.removeItem('googleDocs_auth_state');
    sessionStorage.removeItem('googleDocs_auth_result');
  }, []);

  const refreshAccessToken = useCallback(async (refreshToken: string) => {
    try {
      console.log('🔄 Refreshing access token...');
      setAuthState(prev => ({ ...prev, loading: true }));

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User session not found');
      }

      const response = await fetch(`https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/googledocs-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();
      
      if (data.access_token) {
        const expiresAt = new Date();
        expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));
        
        localStorage.setItem('googleDocs_access_token', data.access_token);
        localStorage.setItem('googleDocs_expires_at', expiresAt.toISOString());
        
        const storedUserName = localStorage.getItem('googleDocs_user_name');
        
        setAuthState({
          isAuthenticated: true,
          accessToken: data.access_token,
          userName: storedUserName,
          loading: false,
          error: null
        });
        
        console.log('✅ Token refreshed successfully');
      } else {
        throw new Error('No access token in refresh response');
      }
    } catch (error) {
      console.error('❌ Token refresh failed:', error);
      clearStoredTokens();
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        userName: null,
        loading: false,
        error: null
      });
    }
  }, [clearStoredTokens]);

  // Check for existing tokens in localStorage for persistence across sessions
  useEffect(() => {
    const storedToken = localStorage.getItem('googleDocs_access_token');
    const storedUserName = localStorage.getItem('googleDocs_user_name');
    const expiresAt = localStorage.getItem('googleDocs_expires_at');
    const refreshToken = localStorage.getItem('googleDocs_refresh_token');
    
    console.log('🔍 Checking stored credentials:', {
      hasToken: !!storedToken,
      hasUserName: !!storedUserName,
      expiresAt,
      isExpired: expiresAt ? new Date(expiresAt) <= new Date() : 'no expiry'
    });
    
    if (storedToken && expiresAt && new Date(expiresAt) > new Date()) {
      console.log('✅ Using stored valid token');
      setAuthState({
        isAuthenticated: true,
        accessToken: storedToken,
        userName: storedUserName,
        loading: false,
        error: null
      });
    } else if (storedToken && expiresAt && new Date(expiresAt) <= new Date()) {
      console.log('🔄 Token expired, attempting refresh...');
      if (refreshToken) {
        // Try to refresh the token
        refreshAccessToken(refreshToken);
      } else {
        // Clear expired tokens
        clearStoredTokens();
      }
    }
  }, [refreshAccessToken, clearStoredTokens]);

  // Listen for the OAuth callback from the popup window
  useEffect(() => {
    const handleAuthCallback = (event: MessageEvent) => {
      console.log('📨 [GOOGLE DOCS AUTH] Received message:', {
        origin: event.origin,
        expectedOrigin: window.location.origin,
        type: event.data?.type,
        hasData: !!event.data,
        timestamp: event.data?.timestamp
      });
      
      if (
        event.origin === window.location.origin &&
        event.data &&
        event.data.type === 'googledocs_oauth_callback'
      ) {
        console.log('✅ [GOOGLE DOCS AUTH] Valid OAuth callback received:', event.data);
        
        // Clear any previous errors and ensure we stay in loading state
        setAuthState(prev => ({ ...prev, error: null, loading: true }));
        
        if (event.data.error) {
          console.error('❌ [GOOGLE DOCS AUTH] OAuth callback error:', event.data.error);
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: `Authentication failed: ${event.data.error}`
          }));
          // Dispatch auth end event
          window.dispatchEvent(new CustomEvent('googledocs:auth:end', { detail: { success: false } }));
          return;
        }
        
        if (!event.data.code) {
          console.error('❌ [GOOGLE DOCS AUTH] No authorization code received');
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'No authorization code received'
          }));
          // Dispatch auth end event
          window.dispatchEvent(new CustomEvent('googledocs:auth:end', { detail: { success: false } }));
          return;
        }
        
        console.log('🔄 [GOOGLE DOCS AUTH] Processing authorization code...');
        // We have a code, exchange it for tokens
        exchangeCodeForTokens(event.data.code);
      }
    };
    
    // Simplified popup communication with localStorage fallback
    const checkAuthResult = () => {
      const storedResult = localStorage.getItem('googleDocs_auth_pending');
      if (storedResult) {
        try {
          const authData = JSON.parse(storedResult);
          console.log('💾 [GOOGLE DOCS AUTH] Found pending auth result:', authData);
          
          // Remove the pending result
          localStorage.removeItem('googleDocs_auth_pending');
          
          if (authData.error) {
            console.error('❌ OAuth error from storage:', authData.error);
            setAuthState(prev => ({
              ...prev,
              loading: false,
              error: `Authentication failed: ${authData.error}`
            }));
          } else if (authData.code) {
            console.log('🔄 Processing authorization code from storage');
            exchangeCodeForTokens(authData.code);
          }
        } catch (err) {
          console.error('❌ Failed to parse auth result:', err);
          localStorage.removeItem('googleDocs_auth_pending');
        }
      }
    };
    
    // Check immediately and poll for auth results
    checkAuthResult();
    const pollInterval = setInterval(checkAuthResult, 1000);
    
    window.addEventListener('message', handleAuthCallback);
    
    return () => {
      window.removeEventListener('message', handleAuthCallback);
      clearInterval(pollInterval);
    };
  }, []);

  const exchangeCodeForTokens = async (code: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const exchangeStartTime = Date.now();
      console.log('🔄 Exchanging authorization code for tokens...');
      
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User session not found. Please log in and try again.');
      }
      
      // Exchange the code for tokens using direct fetch to avoid Supabase auth interference
      const response = await fetch(`https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/googledocs-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          code,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      
      const exchangeDuration = Date.now() - exchangeStartTime;
      console.log(`📊 Token exchange response received in ${exchangeDuration}ms:`, {
        hasData: !!responseData,
        status: response.status
      });
      
      if (responseData.error) {
        console.error('❌ Token exchange error:', responseData.error);
        const errorMessage = responseData.error || 'Failed to exchange authorization code';
        throw new Error(`Token exchange failed: ${errorMessage}`);
      }
      
      const { access_token, expires_in, token_type } = responseData;
      
      if (!access_token) {
        console.error('❌ No access token in response:', responseData);
        throw new Error('No access token received from Google - authentication incomplete');
      }
      
      console.log('✅ Received access token:', {
        tokenType: token_type,
        expiresIn: expires_in,
        tokenPrefix: access_token.substring(0, 20) + '...'
      });
      
      // Test the token immediately by getting user info
      console.log('🧪 Testing token with user info endpoint...');
      const userTestStartTime = Date.now();
      
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const userTestDuration = Date.now() - userTestStartTime;
      console.log(`📡 User info request completed in ${userTestDuration}ms`);
      
      if (!userResponse.ok) {
        const errorText = await userResponse.text();
        console.error('❌ Token validation failed:', {
          status: userResponse.status,
          statusText: userResponse.statusText,
          response: errorText
        });
        throw new Error(`Token validation failed: ${userResponse.status} - ${errorText}`);
      }
      
      const userData = await userResponse.json();
      console.log('✅ Token validation successful:', {
        email: userData.email,
        name: userData.name,
        verified_email: userData.verified_email
      });
      const userName = userData?.name || userData?.email || 'Google User';
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + (expires_in || 3600));
      
      // Store tokens and user info in localStorage for persistence
      localStorage.setItem('googleDocs_access_token', access_token);
      localStorage.setItem('googleDocs_user_name', userName);
      localStorage.setItem('googleDocs_expires_at', expiresAt.toISOString());
      
      // Store refresh token if available
      if (responseData.refresh_token) {
        localStorage.setItem('googleDocs_refresh_token', responseData.refresh_token);
      }
      
      const totalAuthTime = Date.now() - exchangeStartTime;
      console.log(`💾 Stored credentials successfully! Total auth time: ${totalAuthTime}ms`, {
        userName,
        expiresAt: expiresAt.toISOString()
      });
      
      setAuthState({
        isAuthenticated: true,
        accessToken: access_token,
        userName: userName,
        loading: false,
        error: null
      });

      // Dispatch auth success event
      window.dispatchEvent(new CustomEvent('googledocs:auth:end', { detail: { success: true } }));
      
    } catch (error) {
      console.error('❌ Google Docs auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: `Authentication failed: ${errorMessage}`
      }));
      // Dispatch auth end event
      window.dispatchEvent(new CustomEvent('googledocs:auth:end', { detail: { success: false } }));
    }
  };

  const connect = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const connectStartTime = Date.now();
      console.log('🚀 Starting Google OAuth connection...');
      
      // Dispatch auth start event
      window.dispatchEvent(new CustomEvent('googledocs:auth:start', { detail: { timestamp: Date.now() } }));
      
      // Get current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User session not found. Please log in and try again.');
      }
      
      // Get the client ID from our edge function using direct fetch
      const configResponse = await fetch(`https://zuhcmwujzfddmafozubd.supabase.co/functions/v1/googledocs-auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp1aGNtd3VqemZkZG1hZm96dWJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY1MjUxOTQsImV4cCI6MjA2MjEwMTE5NH0.oz_MnWdGGh76eOjQ2k69OhQhqBh4KXG0Wq_cN-VJwzw',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ action: 'get_client_id' })
      });
      
      if (!configResponse.ok) {
        throw new Error(`Failed to get OAuth config: ${configResponse.statusText}`);
      }
      
      const configData = await configResponse.json();
      
      if (!configData?.client_id) {
        console.error('❌ No client ID in response:', configData);
        throw new Error('Unable to get Google OAuth configuration. Please check server configuration.');
      }
      
      console.log('🔑 Got client ID:', configData.client_id.substring(0, 20) + '...');
      
      // Generate a random state value for security
      const state = Math.random().toString(36).substring(2);
      sessionStorage.setItem('googleDocs_auth_state', state);
      
      // Create auth URL with the actual client ID and proper scopes
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${configData.client_id}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&response_type=code&access_type=offline&prompt=consent&state=${state}`;
      
      console.log('🌐 Opening auth URL with scopes:', SCOPE);
      
      // Open popup for authentication with improved positioning
      const popupWidth = 700;
      const popupHeight = 700;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;
      
      const popup = window.open(
        authUrl,
        'GoogleDocsAuthPopup',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top},scrollbars=yes,resizable=yes`
      );
      
      if (!popup) {
        throw new Error('Failed to open authentication popup. Please allow popups for this site.');
      }
      
      const connectDuration = Date.now() - connectStartTime;
      console.log(`✅ Popup opened successfully in ${connectDuration}ms`);
      
      // Monitor popup status for debugging
      const popupMonitor = setInterval(() => {
        if (popup.closed) {
          console.log('📝 [GOOGLE DOCS AUTH] Popup was closed');
          clearInterval(popupMonitor);
        }
      }, 1000);
      
      // Stop monitoring after 5 minutes
      setTimeout(() => clearInterval(popupMonitor), 5 * 60 * 1000);
      
    } catch (error) {
      console.error('❌ Error initiating Google auth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start authentication';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: `Connection failed: ${errorMessage}`
      }));
      // Dispatch auth end event on error
      window.dispatchEvent(new CustomEvent('googledocs:auth:end', { detail: { success: false } }));
    }
  }, []);


  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting Google Docs...');
    clearStoredTokens();
    
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      userName: null,
      loading: false,
      error: null
    });
  }, [clearStoredTokens]);

  return {
    ...authState,
    connect,
    disconnect
  };
};
