import { useState, useEffect, useCallback } from 'react';
import { DocumentAuthService, AuthState, AuthEventType, AuthCredentials } from '@/services/auth/DocumentAuthService';

export interface UseDocumentAuthResult {
  isAuthenticated: boolean;
  credentials: AuthCredentials | null;
  loading: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

export function useDocumentAuth(authService: DocumentAuthService): UseDocumentAuthResult {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    credentials: null,
    loading: true,
    error: null
  });

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const state = await authService.getAuthState();
        setAuthState(state);
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        setAuthState({
          isAuthenticated: false,
          credentials: null,
          loading: false,
          error: error instanceof Error ? error.message : 'Authentication initialization failed'
        });
      }
    };

    initializeAuth();
  }, [authService]);

  // Listen to auth events
  useEffect(() => {
    const handleAuthStart = () => {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
    };

    const handleAuthSuccess = (event: any) => {
      setAuthState({
        isAuthenticated: true,
        credentials: event.data,
        loading: false,
        error: null
      });
    };

    const handleAuthError = (event: any) => {
      const errorMessage = event.data instanceof Error ? event.data.message : 'Authentication failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
    };

    const handleAuthEnd = () => {
      setAuthState(prev => ({ ...prev, loading: false }));
    };

    const handleTokenRefresh = (event: any) => {
      if (event.data) {
        setAuthState(prev => ({
          ...prev,
          credentials: event.data,
          error: null
        }));
      }
    };

    authService.addEventListener(AuthEventType.AUTH_START, handleAuthStart);
    authService.addEventListener(AuthEventType.AUTH_SUCCESS, handleAuthSuccess);
    authService.addEventListener(AuthEventType.AUTH_ERROR, handleAuthError);
    authService.addEventListener(AuthEventType.AUTH_END, handleAuthEnd);
    authService.addEventListener(AuthEventType.TOKEN_REFRESH, handleTokenRefresh);

    return () => {
      authService.removeEventListener(AuthEventType.AUTH_START, handleAuthStart);
      authService.removeEventListener(AuthEventType.AUTH_SUCCESS, handleAuthSuccess);
      authService.removeEventListener(AuthEventType.AUTH_ERROR, handleAuthError);
      authService.removeEventListener(AuthEventType.AUTH_END, handleAuthEnd);
      authService.removeEventListener(AuthEventType.TOKEN_REFRESH, handleTokenRefresh);
    };
  }, [authService]);

  const connect = useCallback(async () => {
    try {
      const credentials = await authService.authenticate();
      setAuthState({
        isAuthenticated: true,
        credentials,
        loading: false,
        error: null
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
      setAuthState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [authService]);

  const disconnect = useCallback(async () => {
    try {
      await authService.disconnect();
      setAuthState({
        isAuthenticated: false,
        credentials: null,
        loading: false,
        error: null
      });
    } catch (error) {
      console.error('Disconnect failed:', error);
      // Still update state even if disconnect fails
      setAuthState({
        isAuthenticated: false,
        credentials: null,
        loading: false,
        error: null
      });
    }
  }, [authService]);

  const refreshAuth = useCallback(async () => {
    try {
      const state = await authService.getAuthState();
      setAuthState(state);
    } catch (error) {
      console.error('Auth refresh failed:', error);
      setAuthState({
        isAuthenticated: false,
        credentials: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication refresh failed'
      });
    }
  }, [authService]);

  return {
    isAuthenticated: authState.isAuthenticated,
    credentials: authState.credentials,
    loading: authState.loading,
    error: authState.error,
    connect,
    disconnect,
    refreshAuth
  };
}