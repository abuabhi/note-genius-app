
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
    
    // SECURITY FIX: Remove unsafe-inline and unsafe-eval in production
    const scriptSrc = isDev 
      ? `script-src ${origins} 'unsafe-inline' 'unsafe-eval'` // Development only
      : `script-src ${origins} 'strict-dynamic'`; // Production
    
    const styleSrc = isDev
      ? `style-src ${origins} 'unsafe-inline'` // Development only  
      : `style-src ${origins}`;
    
    return [
      `default-src ${origins}`,
      scriptSrc,
      styleSrc,
      `img-src ${origins} https://images.unsplash.com https://*.unsplash.com https://i.vimeocdn.com https://img.youtube.com https://i.ytimg.com https://www.prepgenie.io https://*.lovable.app data: blob:`,
      `font-src ${origins} data:`,
      `connect-src ${origins} https://*.supabase.co wss://*.supabase.co`,
      `frame-src ${origins} https://www.youtube.com https://youtube.com https://player.vimeo.com`,
      `object-src 'none'`,
      `base-uri 'self'`,
      `form-action 'self'`,
      `upgrade-insecure-requests`,
      `block-all-mixed-content`
    ].join('; ');
  }

  private applyHeaders(): void {
    // Only apply CSP via meta tags (X-Frame-Options must be set by server)
    this.addMetaTag('Content-Security-Policy', this.headers['Content-Security-Policy']);
    
    // Log security configuration
    if (config.isDevelopment) {
      console.log('🔒 Security headers configured (client-side):', {
        'Content-Security-Policy': this.headers['Content-Security-Policy']
      });
    }
  }

  private addMetaTag(name: string, content: string): void {
    if (!content) return;
    
    const existing = document.querySelector(`meta[http-equiv="${name}"]`);
    if (existing) {
      existing.setAttribute('content', content);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('http-equiv', name);
      meta.setAttribute('content', content);
      document.head.appendChild(meta);
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
