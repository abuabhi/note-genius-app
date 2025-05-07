
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

// Microsoft OAuth configuration
const clientId = "YOUR_MS_CLIENT_ID"; // Replace with your actual client ID from Azure portal
const redirectUri = `${window.location.origin}/auth/microsoft-callback`;
const tenantId = "common"; // Use "common" for multi-tenant applications
const scopes = ["Notes.Read", "Notes.ReadWrite"];

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
export const initiateOneNoteAuth = () => {
  // Build Microsoft OAuth URL
  const authUrl = new URL(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize`);
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("scope", scopes.join(" "));
  authUrl.searchParams.append("response_mode", "fragment");
  
  // Generate and store a random state parameter to prevent CSRF
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("ms_auth_state", state);
  authUrl.searchParams.append("state", state);
  
  // Open the Microsoft OAuth consent screen in a popup
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  
  window.open(
    authUrl.toString(),
    "microsoft-oauth-popup",
    `width=${width},height=${height},left=${left},top=${top}`
  );
  
  // Listen for the OAuth callback messages from the popup
  window.addEventListener("message", handleOAuthCallback, false);
};

/**
 * Handles the OAuth callback from Microsoft
 */
const handleOAuthCallback = async (event: MessageEvent) => {
  // Make sure the message is coming from our application
  if (event.origin !== window.location.origin) return;
  
  // Check if the message contains OAuth data
  if (!event.data || !event.data.type || event.data.type !== "microsoft_oauth_callback") return;
  
  const { code, state, error } = event.data;
  
  // Verify state to prevent CSRF attacks
  const storedState = localStorage.getItem("ms_auth_state");
  localStorage.removeItem("ms_auth_state");
  
  if (!storedState || state !== storedState) {
    console.error("OAuth state mismatch, possible CSRF attack");
    return;
  }
  
  if (error) {
    console.error("Microsoft OAuth error:", error);
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
      // Store tokens in localStorage or secure storage
      const tokenData = {
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
      };
      localStorage.setItem("onenote_token_data", JSON.stringify(tokenData));
      
      // Trigger any callbacks or state updates
      window.dispatchEvent(new CustomEvent('oneNoteAuthenticated'));
    }
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
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
    
    // Listen for auth event
    const handleAuthEvent = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('oneNoteAuthenticated', handleAuthEvent);
    checkAuthStatus();
    
    return () => {
      window.removeEventListener('oneNoteAuthenticated', handleAuthEvent);
      window.removeEventListener("message", handleOAuthCallback);
    };
  }, []);
  
  // Function to refresh the access token
  const refreshAccessToken = async (refreshToken: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      
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
