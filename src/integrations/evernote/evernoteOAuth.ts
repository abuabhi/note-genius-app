
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

// Define state for the Evernote OAuth hook
export interface EvernoteAuthState {
  isAuthenticated: boolean;
  loading: boolean;
  accessToken: string | null;
  userName: string | null;
  error: string | null;
}

export const useEvernoteAuth = () => {
  const [authState, setAuthState] = useState<EvernoteAuthState>({
    isAuthenticated: false,
    loading: false,
    accessToken: null,
    userName: null,
    error: null,
  });

  // Check existing token on mount
  useEffect(() => {
    const token = localStorage.getItem("evernote_access_token");
    const userName = localStorage.getItem("evernote_user_name");
    
    if (token) {
      setAuthState({
        isAuthenticated: true,
        loading: false,
        accessToken: token,
        userName: userName,
        error: null,
      });
    }
  }, []);

  // Connect to Evernote
  const connect = async () => {
    setAuthState(prevState => ({ ...prevState, loading: true, error: null }));
    
    try {
      // Generate a state parameter to prevent CSRF
      const state = Math.random().toString(36).substring(2, 15);
      localStorage.setItem('evernote_auth_state', state);
      
      // Call Supabase Edge Function to get OAuth URL
      const { data, error } = await supabase.functions.invoke('evernote-auth', {
        body: { action: 'authorize', state },
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to initialize Evernote authorization');
      }
      
      if (!data || !data.authUrl) {
        throw new Error('No authorization URL returned from server');
      }
      
      // Open popup for OAuth flow
      const popup = window.open(
        data.authUrl,
        'evernote-auth-popup',
        'width=800,height=600'
      );
      
      // Listen for messages from the popup
      const handleMessage = (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        if (event.data.type !== 'evernote_oauth_callback') return;
        
        const { code, state: returnedState, error, stateValid } = event.data;
        
        if (returnedState !== state || !stateValid) {
          setAuthState(prevState => ({
            ...prevState,
            loading: false,
            error: 'Invalid state parameter. Authorization failed for security reasons.',
          }));
          return;
        }
        
        if (error) {
          setAuthState(prevState => ({
            ...prevState,
            loading: false,
            error: `Evernote authorization failed: ${error}`,
          }));
          return;
        }
        
        if (code) {
          exchangeCodeForToken(code);
        }
      };
      
      window.addEventListener('message', handleMessage);
      
      // Check if popup was blocked
      const checkPopupClosed = setInterval(() => {
        if (!popup || popup.closed) {
          clearInterval(checkPopupClosed);
          window.removeEventListener('message', handleMessage);
          
          if (!authState.isAuthenticated && authState.loading) {
            setAuthState(prevState => ({
              ...prevState,
              loading: false,
              error: popup ? 'Authentication window was closed' : 'Popup was blocked. Please allow popups for this site.',
            }));
          }
        }
      }, 1000);
      
    } catch (error) {
      console.error('Evernote auth error:', error);
      setAuthState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      }));
    }
  };

  // Exchange authorization code for access token
  const exchangeCodeForToken = async (code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('evernote-auth', {
        body: { action: 'token', code },
      });
      
      if (error || !data) {
        throw new Error(error?.message || 'Failed to get access token');
      }
      
      const { access_token, username } = data;
      
      if (!access_token) {
        throw new Error('No access token returned from server');
      }
      
      // Store token and user info in localStorage
      localStorage.setItem('evernote_access_token', access_token);
      if (username) localStorage.setItem('evernote_user_name', username);
      
      // Update auth state
      setAuthState({
        isAuthenticated: true,
        loading: false,
        accessToken: access_token,
        userName: username || null,
        error: null,
      });
      
    } catch (error) {
      console.error('Token exchange error:', error);
      setAuthState(prevState => ({
        ...prevState,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to get access token',
      }));
    }
  };

  // Disconnect from Evernote
  const disconnect = () => {
    localStorage.removeItem('evernote_access_token');
    localStorage.removeItem('evernote_user_name');
    
    setAuthState({
      isAuthenticated: false,
      loading: false,
      accessToken: null,
      userName: null,
      error: null,
    });
  };

  return {
    ...authState,
    connect,
    disconnect,
  };
};
