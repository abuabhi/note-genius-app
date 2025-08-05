// Unified Authentication Service for Document Import Providers
// This service provides a consistent interface for authentication across all providers

export interface AuthCredentials {
  accessToken: string;
  refreshToken?: string;
  expiresAt: string;
  userName?: string;
  email?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  credentials: AuthCredentials | null;
  loading: boolean;
  error: string | null;
}

export enum AuthEventType {
  AUTH_START = 'auth:start',
  AUTH_SUCCESS = 'auth:success',
  AUTH_ERROR = 'auth:error',
  AUTH_END = 'auth:end',
  TOKEN_REFRESH = 'token:refresh'
}

export interface AuthEvent {
  type: AuthEventType;
  provider: string;
  data?: any;
}

export abstract class DocumentAuthService {
  protected provider: string;
  protected storagePrefix: string;
  protected listeners: Map<AuthEventType, Set<(event: AuthEvent) => void>> = new Map();

  constructor(provider: string) {
    this.provider = provider;
    this.storagePrefix = `${provider}_`;
  }

  // Abstract methods that must be implemented by each provider
  abstract authenticate(): Promise<AuthCredentials>;
  abstract refreshToken(refreshToken: string): Promise<AuthCredentials>;
  abstract disconnect(): Promise<void>;

  // Common token storage methods
  protected storeCredentials(credentials: AuthCredentials): void {
    localStorage.setItem(`${this.storagePrefix}access_token`, credentials.accessToken);
    localStorage.setItem(`${this.storagePrefix}expires_at`, credentials.expiresAt);
    
    if (credentials.refreshToken) {
      localStorage.setItem(`${this.storagePrefix}refresh_token`, credentials.refreshToken);
    }
    if (credentials.userName) {
      localStorage.setItem(`${this.storagePrefix}user_name`, credentials.userName);
    }
    if (credentials.email) {
      localStorage.setItem(`${this.storagePrefix}email`, credentials.email);
    }
  }

  protected getStoredCredentials(): AuthCredentials | null {
    const accessToken = localStorage.getItem(`${this.storagePrefix}access_token`);
    const expiresAt = localStorage.getItem(`${this.storagePrefix}expires_at`);
    
    if (!accessToken || !expiresAt) {
      return null;
    }

    return {
      accessToken,
      expiresAt,
      refreshToken: localStorage.getItem(`${this.storagePrefix}refresh_token`) || undefined,
      userName: localStorage.getItem(`${this.storagePrefix}user_name`) || undefined,
      email: localStorage.getItem(`${this.storagePrefix}email`) || undefined,
    };
  }

  protected clearCredentials(): void {
    const keys = [
      'access_token',
      'refresh_token', 
      'expires_at',
      'user_name',
      'email'
    ];
    
    keys.forEach(key => {
      localStorage.removeItem(`${this.storagePrefix}${key}`);
    });
    
    // Clear any pending auth data
    localStorage.removeItem(`${this.storagePrefix}auth_pending`);
    sessionStorage.removeItem(`${this.storagePrefix}auth_state`);
  }

  protected isTokenExpired(expiresAt: string): boolean {
    return new Date(expiresAt) <= new Date();
  }

  protected async validateAndRefreshToken(credentials: AuthCredentials): Promise<AuthCredentials> {
    if (this.isTokenExpired(credentials.expiresAt)) {
      if (credentials.refreshToken) {
        console.log(`🔄 [${this.provider.toUpperCase()}] Token expired, refreshing...`);
        return await this.refreshToken(credentials.refreshToken);
      } else {
        throw new Error('Token expired and no refresh token available');
      }
    }
    return credentials;
  }

  // Event system for auth state changes
  addEventListener(type: AuthEventType, listener: (event: AuthEvent) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: AuthEventType, listener: (event: AuthEvent) => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  protected emit(type: AuthEventType, data?: any): void {
    const event: AuthEvent = { type, provider: this.provider, data };
    this.listeners.get(type)?.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`Error in auth event listener:`, error);
      }
    });
  }

  // Public method to get current auth state
  async getAuthState(): Promise<AuthState> {
    try {
      const credentials = this.getStoredCredentials();
      
      if (!credentials) {
        return {
          isAuthenticated: false,
          credentials: null,
          loading: false,
          error: null
        };
      }

      const validCredentials = await this.validateAndRefreshToken(credentials);
      
      return {
        isAuthenticated: true,
        credentials: validCredentials,
        loading: false,
        error: null
      };
    } catch (error) {
      console.error(`[${this.provider.toUpperCase()}] Auth state check failed:`, error);
      this.clearCredentials();
      
      return {
        isAuthenticated: false,
        credentials: null,
        loading: false,
        error: error instanceof Error ? error.message : 'Authentication check failed'
      };
    }
  }
}