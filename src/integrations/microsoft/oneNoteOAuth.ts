import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

// Microsoft OAuth configuration - client ID will be fetched from Supabase
let clientId: string | null = null;
const redirectUri = `${window.location.origin}/auth/microsoft-callback`;
const tenantId = "common"; // Use "common" for multi-tenant applications
const scopes = ["Notes.Read", "Notes.ReadWrite", "User.Read"];

// Fetch Microsoft Client ID from Supabase secrets
const getMicrosoftClientId = async (): Promise<string | null> => {
  if (clientId) return clientId; // Return cached value if available
  
  try {
    const { data, error } = await supabase.functions.invoke('microsoft-auth', {
      body: { action: 'get_client_id' }
    });
    
    if (error) {
      console.error('Error fetching Microsoft Client ID:', error);
      return null;
    }
    
    clientId = data?.client_id || null;
    return clientId;
  } catch (error) {
    console.error('Failed to fetch Microsoft Client ID:', error);
    return null;
  }
};

// Types for Microsoft OAuth
export interface MicrosoftAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  tokenExpiry: number | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initiates the Microsoft OAuth authentication flow
 */
export const initiateOneNoteAuth = async (forceAccountSelection = false) => {
  // Fetch client ID from Supabase
  const fetchedClientId = await getMicrosoftClientId();
  
  if (!fetchedClientId) {
    alert("Microsoft Graph client ID is not configured. Please contact your administrator.");
    return;
  }

  // Build Microsoft OAuth URL
  const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
  authUrl.searchParams.append("client_id", fetchedClientId);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("scope", scopes.join(" "));
  authUrl.searchParams.append("response_mode", "fragment");
  
  // Force account selection if requested
  if (forceAccountSelection) {
    authUrl.searchParams.append("prompt", "select_account");
  }
  
  // Generate and store a random state parameter to prevent CSRF
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("ms_auth_state", state);
  authUrl.searchParams.append("state", state);
  
  // Open the Microsoft OAuth consent screen in a popup
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  
  const popup = window.open(
    authUrl.toString(),
    "microsoft-oauth-popup",
    `width=${width},height=${height},left=${left},top=${top}`
  );
  
  // Listen for the OAuth callback messages from the popup
  const messageHandler = (event: MessageEvent) => {
    if (event.origin !== window.location.origin) return;
    
    if (event.data && event.data.type === "microsoft_oauth_callback") {
      handleOAuthCallback(event);
      window.removeEventListener("message", messageHandler);
      if (popup) popup.close();
    }
  };
  
  window.addEventListener("message", messageHandler, false);
  
  // Check if popup was closed manually
  const checkClosed = setInterval(() => {
    if (popup?.closed) {
      clearInterval(checkClosed);
      window.removeEventListener("message", messageHandler);
    }
  }, 1000);
};

/**
 * Handles the OAuth callback from Microsoft
 */
const handleOAuthCallback = async (event: MessageEvent) => {
  const { code, state, error } = event.data;
  
  // Verify state to prevent CSRF attacks
  const storedState = localStorage.getItem("ms_auth_state");
  localStorage.removeItem("ms_auth_state");
  
  if (!storedState || state !== storedState) {
    console.error("OAuth state mismatch, possible CSRF attack");
    window.dispatchEvent(new CustomEvent('oneNoteAuthError', { 
      detail: { error: 'State mismatch - possible security issue' }
    }));
    return;
  }
  
  if (error) {
    console.error("Microsoft OAuth error:", error);
    window.dispatchEvent(new CustomEvent('oneNoteAuthError', { 
      detail: { error: `OAuth error: ${error}` }
    }));
    return;
  }
  
  try {
    // Exchange the code for access and refresh tokens
    const { data, error } = await supabase.functions.invoke('microsoft-auth', {
      body: {
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code"
      }
    });
    
    if (error) throw new Error(error.message || "Failed to exchange auth code");
    
    if (data && data.access_token) {
      // Store tokens in localStorage
      const tokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
      };
      localStorage.setItem("onenote_token_data", JSON.stringify(tokenData));
      
      // Trigger authentication success event
      window.dispatchEvent(new CustomEvent('oneNoteAuthenticated', { 
        detail: { tokenData }
      }));
    }
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
    window.dispatchEvent(new CustomEvent('oneNoteAuthError', { 
      detail: { error: error.message || 'Token exchange failed' }
    }));
  }
};

/**
 * Hook for managing OneNote authentication state
 */
export const useOneNoteAuth = () => {
  const [authState, setAuthState] = useState<MicrosoftAuthState>({
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
    loading: true,
    error: null
  });
  
  // Check for existing auth state on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const tokenDataStr = localStorage.getItem("onenote_token_data");
        if (!tokenDataStr) {
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        const tokenData = JSON.parse(tokenDataStr);
        const isExpired = Date.now() > tokenData.expires_at;
        
        if (isExpired && tokenData.refresh_token) {
          // Token is expired, try to refresh it
          refreshAccessToken(tokenData.refresh_token);
        } else if (!isExpired && tokenData.access_token) {
          // Token is valid
          setAuthState({
            isAuthenticated: true,
            accessToken: tokenData.access_token,
            refreshToken: tokenData.refresh_token,
            tokenExpiry: tokenData.expires_at,
            loading: false,
            error: null
          });
        } else {
          // No valid token
          setAuthState(prev => ({ ...prev, loading: false }));
        }
      } catch (error) {
        console.error("Error checking auth status:", error);
        setAuthState({
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
          loading: false,
          error: "Failed to load authentication state"
        });
      }
    };
    
    // Listen for auth events
    const handleAuthEvent = (event: CustomEvent) => {
      const { tokenData } = event.detail;
      setAuthState({
        isAuthenticated: true,
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        tokenExpiry: tokenData.expires_at,
        loading: false,
        error: null
      });
    };
    
    const handleAuthError = (event: CustomEvent) => {
      const { error } = event.detail;
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: error
      }));
    };
    
    window.addEventListener('oneNoteAuthenticated', handleAuthEvent as EventListener);
    window.addEventListener('oneNoteAuthError', handleAuthError as EventListener);
    checkAuthStatus();
    
    return () => {
      window.removeEventListener('oneNoteAuthenticated', handleAuthEvent as EventListener);
      window.removeEventListener('oneNoteAuthError', handleAuthError as EventListener);
    };
  }, []);
  
  // Function to refresh the access token
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const { data, error } = await supabase.functions.invoke('microsoft-auth', {
        body: {
          refresh_token: refreshToken,
          grant_type: "refresh_token"
        }
      });
      
      if (error) throw new Error(error.message || "Failed to refresh token");
      
      if (data && data.access_token) {
        // Update stored tokens
        const tokenData = {
          access_token: data.access_token,
          refresh_token: data.refresh_token || refreshToken, // Use new refresh token if available
          expires_at: Date.now() + data.expires_in * 1000,
        };
        localStorage.setItem("onenote_token_data", JSON.stringify(tokenData));
        
        setAuthState({
          isAuthenticated: true,
          accessToken: tokenData.access_token,
          refreshToken: tokenData.refresh_token,
          tokenExpiry: tokenData.expires_at,
          loading: false,
          error: null
        });
      }
    } catch (error) {
      console.error("Error refreshing token:", error);
      setAuthState({
        isAuthenticated: false,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
        loading: false,
        error: "Failed to refresh authentication token"
      });
      localStorage.removeItem("onenote_token_data");
    }
  };
  
  // Function to disconnect OneNote
  const disconnect = () => {
    localStorage.removeItem("onenote_token_data");
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,
      tokenExpiry: null,
      loading: false,
      error: null
    });
  };
  
  return {
    ...authState,
    connect: initiateOneNoteAuth,
    disconnect,
    refreshToken: refreshAccessToken
  };
};
