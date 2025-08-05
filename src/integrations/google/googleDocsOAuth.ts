
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

  // Check for existing tokens in sessionStorage (isolated from main app)
  useEffect(() => {
    const storedToken = sessionStorage.getItem('googleDocs_access_token');
    const storedUserName = sessionStorage.getItem('googleDocs_user_name');
    const expiresAt = sessionStorage.getItem('googleDocs_expires_at');
    
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
      console.log('🔄 Token expired, clearing storage');
      // Clear expired tokens
      sessionStorage.removeItem('googleDocs_access_token');
      sessionStorage.removeItem('googleDocs_user_name');
      sessionStorage.removeItem('googleDocs_expires_at');
    }
  }, []);

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
          return;
        }
        
        if (!event.data.code) {
          console.error('❌ [GOOGLE DOCS AUTH] No authorization code received');
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'No authorization code received'
          }));
          return;
        }
        
        console.log('🔄 [GOOGLE DOCS AUTH] Processing authorization code...');
        // We have a code, exchange it for tokens
        exchangeCodeForTokens(event.data.code);
      }
    };
    
    // Also check for stored auth result (fallback for when popup communication fails)
    const checkStoredAuthResult = () => {
      const storedResult = sessionStorage.getItem('googleDocs_auth_result');
      if (storedResult) {
        try {
          const authData = JSON.parse(storedResult);
          console.log('💾 [GOOGLE DOCS AUTH] Found stored auth result:', authData);
          
          // Remove the stored result to prevent reprocessing
          sessionStorage.removeItem('googleDocs_auth_result');
          
          // Process like a regular callback
          if (authData.error) {
            console.error('❌ Stored OAuth error:', authData.error);
            setAuthState(prev => ({
              ...prev,
              loading: false,
              error: `Authentication failed: ${authData.error}`
            }));
          } else if (authData.code) {
            console.log('🔄 Processing stored authorization code');
            exchangeCodeForTokens(authData.code);
          }
        } catch (err) {
          console.error('❌ Failed to parse stored auth result:', err);
          sessionStorage.removeItem('googleDocs_auth_result');
        }
      }
    };
    
    // Check for stored result immediately and set up polling
    checkStoredAuthResult();
    const pollInterval = setInterval(checkStoredAuthResult, 500); // Faster polling for better responsiveness
    
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
      
      // Store tokens and user info in sessionStorage (isolated from main app)
      sessionStorage.setItem('googleDocs_access_token', access_token);
      sessionStorage.setItem('googleDocs_user_name', userName);
      sessionStorage.setItem('googleDocs_expires_at', expiresAt.toISOString());
      
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
      
    } catch (error) {
      console.error('❌ Google Docs auth error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: `Authentication failed: ${errorMessage}`
      }));
    }
  };

  const connect = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      const connectStartTime = Date.now();
      console.log('🚀 Starting Google OAuth connection...');
      
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
      
    } catch (error) {
      console.error('❌ Error initiating Google auth:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to start authentication';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: `Connection failed: ${errorMessage}`
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting Google Docs...');
    // Clear stored tokens and state from sessionStorage
    sessionStorage.removeItem('googleDocs_access_token');
    sessionStorage.removeItem('googleDocs_user_name');
    sessionStorage.removeItem('googleDocs_expires_at');
    sessionStorage.removeItem('googleDocs_auth_state');
    
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      userName: null,
      loading: false,
      error: null
    });
  }, []);

  return {
    ...authState,
    connect,
    disconnect
  };
};
