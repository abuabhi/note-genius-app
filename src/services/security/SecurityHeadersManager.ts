
import { config } from '@/config/environment';

interface SecurityHeaders {
  'Content-Security-Policy': string;
  'X-Frame-Options': string;
  'X-Content-Type-Options': string;
  'Referrer-Policy': string;
  'Permissions-Policy': string;
  'Strict-Transport-Security': string;
}

class SecurityHeadersManager {
  private headers: SecurityHeaders;

  constructor() {
    this.headers = this.generateHeaders();
    this.applyHeaders();
  }

  private generateHeaders(): SecurityHeaders {
    const isDevelopment = config.isDevelopment;
    const allowedOrigins = isDevelopment 
      ? ["'self'", 'http://localhost:3000', 'https://cdn.gpteng.co']
      : ["'self'", 'https://cdn.gpteng.co'];

    return {
      'Content-Security-Policy': this.generateCSP(allowedOrigins),
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
      'Strict-Transport-Security': isDevelopment ? '' : 'max-age=31536000; includeSubDomains'
    };
  }

  private generateCSP(allowedOrigins: string[]): string {
    const origins = allowedOrigins.join(' ');
    const isDev = config.isDevelopment;
    
    // SECURITY FIX: Allow dynamic imports for lazy-loaded components
    const scriptSrc = isDev 
      ? `script-src ${origins} 'unsafe-inline' 'unsafe-eval'` // Development only
      : `script-src ${origins} 'unsafe-inline' 'unsafe-eval'`; // Production - need both for Vite dynamic imports
    
    const styleSrc = isDev
      ? `style-src ${origins} 'unsafe-inline'` // Development only  
      : `style-src ${origins} 'unsafe-inline'`; // Production - allow inline styles
    
    return [
      `default-src ${origins}`,
      scriptSrc,
      styleSrc,
      `img-src ${origins} https://images.unsplash.com https://*.unsplash.com data: blob:`,
      `font-src ${origins} data:`,
      `media-src ${origins} https://*.supabase.co data: blob:`, // AUDIO FIX: Allow Supabase media
      `connect-src ${origins} https://*.supabase.co wss://*.supabase.co`,
      `frame-src 'none'`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `upgrade-insecure-requests`,
      `block-all-mixed-content`
    ].join('; ');
  }

  private applyHeaders(): void {
    // TEMPORARY DISABLE: Client-side CSP meta tags are unreliable and override server CSP
    // This is causing audio playback issues. Server-side CSP configuration needed instead.
    
    if (config.isDevelopment) {
      console.log('🔒 [CSP DEBUG] Client-side CSP application DISABLED to resolve audio issues');
      console.log('🔒 [CSP DEBUG] Generated CSP (not applied):', this.headers['Content-Security-Policy']);
    }
    
    // Don't apply CSP meta tags - let server handle CSP properly
    // this.addMetaTag('Content-Security-Policy', this.headers['Content-Security-Policy']);
    
    // Log security configuration  
    if (config.isDevelopment) {
      console.log('🔒 Security headers configured (client-side CSP disabled):', {
        'Content-Security-Policy': '(disabled - server-side required)'
      });
    }
  }

  private addMetaTag(name: string, content: string): void {
    if (!content) {
      if (config.isDevelopment) {
        console.warn('🔒 [CSP DEBUG] Empty content for meta tag:', name);
      }
      return;
    }
    
    if (config.isDevelopment) {
      console.log('🔒 [CSP DEBUG] Adding meta tag:', name, content.substring(0, 100) + '...');
    }
    
    const existing = document.querySelector(`meta[http-equiv="${name}"]`);
    if (existing) {
      if (config.isDevelopment) {
        console.log('🔒 [CSP DEBUG] Updating existing meta tag');
      }
      existing.setAttribute('content', content);
    } else {
      if (config.isDevelopment) {
        console.log('🔒 [CSP DEBUG] Creating new meta tag');
      }
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
    }
    
    // Verify it was added
    if (config.isDevelopment) {
      const verification = document.querySelector(`meta[http-equiv="${name}"]`);
      console.log('🔒 [CSP DEBUG] Meta tag verification:', !!verification, verification?.getAttribute('content')?.substring(0, 50) + '...');
    }
  }

  // Public method to get headers for server-side implementation
  getHeaders(): SecurityHeaders {
    return { ...this.headers };
  }

  // Method to update CSP for dynamic content
  updateCSP(additionalSources: string[]): void {
    const currentCSP = this.headers['Content-Security-Policy'];
    const updatedCSP = currentCSP.replace(
      /script-src ([^;]+)/,
      `script-src $1 ${additionalSources.join(' ')}`
    );
    
    this.headers['Content-Security-Policy'] = updatedCSP;
    this.addMetaTag('Content-Security-Policy', updatedCSP);
  }
}

export const securityHeadersManager = new SecurityHeadersManager();
