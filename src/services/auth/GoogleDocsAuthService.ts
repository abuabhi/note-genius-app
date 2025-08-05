import { DocumentAuthService, AuthCredentials, AuthEventType } from './DocumentAuthService';
import { supabase } from '@/integrations/supabase/client';

export class GoogleDocsAuthService extends DocumentAuthService {
  private static instance: GoogleDocsAuthService | null = null;
  
  constructor() {
    super('googledocs');
  }

  // Singleton pattern to ensure consistent state
  static getInstance(): GoogleDocsAuthService {
    if (!GoogleDocsAuthService.instance) {
      GoogleDocsAuthService.instance = new GoogleDocsAuthService();
    }
    return GoogleDocsAuthService.instance;
  }

  async authenticate(): Promise<AuthCredentials> {
    this.emit(AuthEventType.AUTH_START);

    try {
      // Get client ID from edge function
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User session not found. Please log in and try again.');
      }

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
        throw new Error('Unable to get Google OAuth configuration');
      }

      // Create auth URL
      const REDIRECT_URI = `${window.location.origin}/oauth2callback`;
      const SCOPE = 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents.readonly https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/userinfo.profile';
      const state = Math.random().toString(36).substring(2);
      
      sessionStorage.setItem(`${this.storagePrefix}auth_state`, state);

      const authUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${configData.client_id}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPE)}&response_type=code&access_type=offline&prompt=consent&state=${state}`;

      // Open popup with better positioning
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

      console.log('🚀 [GOOGLE DOCS] Authentication popup opened');

      // Wait for authentication result
      const credentials = await this.waitForAuthResult(popup);
      
      this.storeCredentials(credentials);
      this.emit(AuthEventType.AUTH_SUCCESS, credentials);
      
      return credentials;

    } catch (error) {
      console.error('❌ [GOOGLE DOCS] Authentication failed:', error);
      this.emit(AuthEventType.AUTH_ERROR, error);
      throw error;
    } finally {
      this.emit(AuthEventType.AUTH_END);
    }
  }

  private async waitForAuthResult(popup: Window): Promise<AuthCredentials> {
    return new Promise((resolve, reject) => {
      let resolved = false;
      
      const cleanup = () => {
        window.removeEventListener('message', messageHandler);
        clearInterval(pollInterval);
        clearInterval(popupMonitor);
        clearTimeout(timeout);
      };

      // Handle postMessage from callback
      const messageHandler = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin || event.data?.type !== 'googledocs_oauth_callback') {
          return;
        }

        if (resolved) return;
        resolved = true;
        cleanup();

        console.log('📨 [GOOGLE DOCS] OAuth callback received:', event.data);

        if (event.data.error) {
          reject(new Error(event.data.error));
          return;
        }

        if (!event.data.code) {
          reject(new Error('No authorization code received'));
          return;
        }

        try {
          const credentials = await this.exchangeCodeForTokens(event.data.code);
          resolve(credentials);
        } catch (error) {
          reject(error);
        }
      };

      // Fallback: Check localStorage for auth result
      const pollForResult = () => {
        const pendingResult = localStorage.getItem(`${this.storagePrefix}auth_pending`);
        if (pendingResult && !resolved) {
          try {
            const authData = JSON.parse(pendingResult);
            localStorage.removeItem(`${this.storagePrefix}auth_pending`);

            resolved = true;
            cleanup();

            if (authData.error) {
              reject(new Error(authData.error));
            } else if (authData.code) {
              this.exchangeCodeForTokens(authData.code).then(resolve).catch(reject);
            } else {
              reject(new Error('Invalid auth result'));
            }
          } catch (error) {
            console.error('❌ Failed to parse auth result:', error);
            localStorage.removeItem(`${this.storagePrefix}auth_pending`);
          }
        }
      };

      // Monitor popup status
      const popupMonitor = setInterval(() => {
        if (popup.closed && !resolved) {
          resolved = true;
          cleanup();
          reject(new Error('Authentication popup was closed'));
        }
      }, 1000);

      // Timeout after 5 minutes
      const timeout = setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          if (!popup.closed) popup.close();
          reject(new Error('Authentication timeout'));
        }
      }, 5 * 60 * 1000);

      // Poll for results every second
      const pollInterval = setInterval(pollForResult, 1000);

      window.addEventListener('message', messageHandler);
      
      // Check immediately for any existing result
      pollForResult();
    });
  }

  private async exchangeCodeForTokens(code: string): Promise<AuthCredentials> {
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
        code,
        redirect_uri: `${window.location.origin}/oauth2callback`,
        grant_type: 'authorization_code'
      })
    });

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }

    if (!data.access_token) {
      throw new Error('No access token received');
    }

    // Get user info to validate token
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${data.access_token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      throw new Error('Token validation failed');
    }

    const userData = await userResponse.json();
    
    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresAt: expiresAt.toISOString(),
      userName: userData.name || userData.email,
      email: userData.email
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthCredentials> {
    this.emit(AuthEventType.TOKEN_REFRESH);

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
    
    if (!data.access_token) {
      throw new Error('No access token in refresh response');
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (data.expires_in || 3600));

    const credentials: AuthCredentials = {
      accessToken: data.access_token,
      refreshToken: refreshToken, // Keep existing refresh token
      expiresAt: expiresAt.toISOString(),
      userName: this.getStoredCredentials()?.userName,
      email: this.getStoredCredentials()?.email
    };

    this.storeCredentials(credentials);
    return credentials;
  }

  async disconnect(): Promise<void> {
    console.log('🔌 [GOOGLE DOCS] Disconnecting...');
    this.clearCredentials();
    this.emit(AuthEventType.AUTH_END);
  }
}