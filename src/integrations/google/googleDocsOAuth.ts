import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../supabase/client';

// Configuration for Google OAuth
const REDIRECT_URI = `${window.location.origin}/auth/googledocs/callback`;
const SCOPE = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents.readonly';

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

  // Check for existing tokens in localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem('googleDocs_access_token');
    const storedUserName = localStorage.getItem('googleDocs_user_name');
    const expiresAt = localStorage.getItem('googleDocs_expires_at');
    
    if (storedToken && expiresAt && new Date(expiresAt) > new Date()) {
      setAuthState({
        isAuthenticated: true,
        accessToken: storedToken,
        userName: storedUserName,
        loading: false,
        error: null
      });
    }
  }, []);

  // Listen for the OAuth callback from the popup window
  useEffect(() => {
    const handleAuthCallback = (event: MessageEvent) => {
      if (
        event.origin === window.location.origin &&
        event.data &&
        event.data.type === 'googledocs_oauth_callback'
      ) {
        // Clear any previous errors
        setAuthState(prev => ({ ...prev, error: null }));
        
        if (event.data.error) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: `Authentication failed: ${event.data.error}`
          }));
          return;
        }
        
        if (!event.data.code) {
          setAuthState(prev => ({
            ...prev,
            loading: false,
            error: 'No authorization code received'
          }));
          return;
        }
        
        // We have a code, exchange it for tokens
        exchangeCodeForTokens(event.data.code);
      }
    };
    
    window.addEventListener('message', handleAuthCallback);
    return () => window.removeEventListener('message', handleAuthCallback);
  }, []);

  const exchangeCodeForTokens = async (code: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Exchange the code for tokens using our edge function
      const response = await supabase.functions.invoke('googledocs-auth', {
        body: {
          code,
          redirect_uri: REDIRECT_URI,
          grant_type: 'authorization_code'
        }
      });
      
      if (response.error) {
        throw new Error(response.error.message || 'Failed to exchange authorization code');
      }
      
      const { access_token, expires_in } = response.data;
      
      if (!access_token) {
        throw new Error('No access token received');
      }
      
      // Get user info
      const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${access_token}`
        }
      });
      
      const userData = await userResponse.json();
      const userName = userData?.name || 'Google User';
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expires_in);
      
      // Store tokens and user info
      localStorage.setItem('googleDocs_access_token', access_token);
      localStorage.setItem('googleDocs_user_name', userName);
      localStorage.setItem('googleDocs_expires_at', expiresAt.toISOString());
      
      setAuthState({
        isAuthenticated: true,
        accessToken: access_token,
        userName: userName,
        loading: false,
        error: null
      });
      
    } catch (error) {
      console.error('Google Docs auth error:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }));
    }
  };

  const connect = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
      // Get the client ID from our edge function
      const { data: configData, error: configError } = await supabase.functions.invoke('googledocs-auth', {
        body: { action: 'get_client_id' }
      });
      
      if (configError || !configData?.client_id) {
        throw new Error('Unable to get Google OAuth configuration');
      }
      
      // Generate a random state value for security
      const state = Math.random().toString(36).substring(2);
      localStorage.setItem('googleDocs_auth_state', state);
      
      // Create auth URL with the actual client ID
      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${configData.client_id}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&response_type=code&access_type=offline&prompt=consent&state=${state}`;
      
      // Open popup for authentication
      const popupWidth = 700;
      const popupHeight = 700;
      const left = window.screenX + (window.outerWidth - popupWidth) / 2;
      const top = window.screenY + (window.outerHeight - popupHeight) / 2;
      
      window.open(
        authUrl,
        'GoogleDocsAuthPopup',
        `width=${popupWidth},height=${popupHeight},left=${left},top=${top}`
      );
    } catch (error) {
      console.error('Error initiating Google auth:', error);
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to start authentication'
      }));
    }
  }, []);

  const disconnect = useCallback(() => {
    // Clear stored tokens and state
    localStorage.removeItem('googleDocs_access_token');
    localStorage.removeItem('googleDocs_user_name');
    localStorage.removeItem('googleDocs_expires_at');
    localStorage.removeItem('googleDocs_auth_state');
    
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
