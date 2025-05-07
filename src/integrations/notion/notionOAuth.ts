
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect } from "react";

// Notion OAuth configuration
const clientId = "YOUR_NOTION_CLIENT_ID"; // Replace with your actual client ID from Notion
const redirectUri = `${window.location.origin}/auth/notion-callback`;
const scopes = ["read_content", "read_user"];

// Types for Notion OAuth
export interface NotionAuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  tokenExpiry: number | null;
  workspaceId: string | null;
  workspaceName: string | null;
  loading: boolean;
  error: string | null;
}

/**
 * Initiates the Notion OAuth authentication flow
 */
export const initiateNotionAuth = () => {
  // Build Notion OAuth URL
  const authUrl = new URL("https://api.notion.com/v1/oauth/authorize");
  authUrl.searchParams.append("client_id", clientId);
  authUrl.searchParams.append("response_type", "code");
  authUrl.searchParams.append("redirect_uri", redirectUri);
  authUrl.searchParams.append("scope", scopes.join(" "));
  
  // Generate and store a random state parameter to prevent CSRF
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem("notion_auth_state", state);
  authUrl.searchParams.append("state", state);
  
  // Open the Notion OAuth consent screen in a popup
  const width = 600;
  const height = 700;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2.5;
  
  window.open(
    authUrl.toString(),
    "notion-oauth-popup",
    `width=${width},height=${height},left=${left},top=${top}`
  );
  
  // Listen for the OAuth callback messages from the popup
  window.addEventListener("message", handleOAuthCallback, false);
};

/**
 * Handles the OAuth callback from Notion
 */
const handleOAuthCallback = async (event: MessageEvent) => {
  // Make sure the message is coming from our application
  if (event.origin !== window.location.origin) return;
  
  // Check if the message contains OAuth data
  if (!event.data || !event.data.type || event.data.type !== "notion_oauth_callback") return;
  
  const { code, state, error } = event.data;
  
  // Verify state to prevent CSRF attacks
  const storedState = localStorage.getItem("notion_auth_state");
  localStorage.removeItem("notion_auth_state");
  
  if (!storedState || state !== storedState) {
    console.error("OAuth state mismatch, possible CSRF attack");
    return;
  }
  
  if (error) {
    console.error("Notion OAuth error:", error);
    return;
  }
  
  try {
    // Exchange the code for access and refresh tokens using Supabase edge function
    const { data, error } = await supabase.functions.invoke('notion-auth', {
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
        workspace_id: data.workspace_id,
        workspace_name: data.workspace_name,
        expires_at: Date.now() + (data.expires_in || 3600) * 1000,
      };
      localStorage.setItem("notion_token_data", JSON.stringify(tokenData));
      
      // Trigger any callbacks or state updates
      window.dispatchEvent(new CustomEvent('notionAuthenticated'));
    }
  } catch (error) {
    console.error("Error exchanging code for tokens:", error);
  }
};

/**
 * Hook for managing Notion authentication state
 */
export const useNotionAuth = () => {
  const [authState, setAuthState] = useState<NotionAuthState>({
    isAuthenticated: false,
    accessToken: null,
    tokenExpiry: null,
    workspaceId: null,
    workspaceName: null,
    loading: true,
    error: null
  });
  
  // Check for existing auth state on component mount
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const tokenDataStr = localStorage.getItem("notion_token_data");
        if (!tokenDataStr) {
          setAuthState(prev => ({ ...prev, loading: false }));
          return;
        }
        
        const tokenData = JSON.parse(tokenDataStr);
        const isExpired = tokenData.expires_at ? Date.now() > tokenData.expires_at : false;
        
        if (isExpired) {
          // Token is expired, need to re-authenticate
          localStorage.removeItem("notion_token_data");
          setAuthState({
            isAuthenticated: false,
            accessToken: null,
            tokenExpiry: null,
            workspaceId: null,
            workspaceName: null,
            loading: false,
            error: "Session expired. Please reconnect to Notion."
          });
        } else if (tokenData.access_token) {
          // Token is valid
          setAuthState({
            isAuthenticated: true,
            accessToken: tokenData.access_token,
            tokenExpiry: tokenData.expires_at,
            workspaceId: tokenData.workspace_id,
            workspaceName: tokenData.workspace_name,
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
          tokenExpiry: null,
          workspaceId: null,
          workspaceName: null,
          loading: false,
          error: "Failed to load authentication state"
        });
      }
    };
    
    // Listen for auth event
    const handleAuthEvent = () => {
      checkAuthStatus();
    };
    
    window.addEventListener('notionAuthenticated', handleAuthEvent);
    checkAuthStatus();
    
    return () => {
      window.removeEventListener('notionAuthenticated', handleAuthEvent);
      window.removeEventListener("message", handleOAuthCallback);
    };
  }, []);
  
  // Function to disconnect Notion
  const disconnect = () => {
    localStorage.removeItem("notion_token_data");
    setAuthState({
      isAuthenticated: false,
      accessToken: null,
      tokenExpiry: null,
      workspaceId: null,
      workspaceName: null,
      loading: false,
      error: null
    });
  };
  
  return {
    ...authState,
    connect: initiateNotionAuth,
    disconnect
  };
};
