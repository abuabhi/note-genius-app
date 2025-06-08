
import React, { Component, ReactNode } from 'react';
import { AlertTriangle, Shield, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SecurityErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<SecurityErrorFallbackProps>;
  onSecurityViolation?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface SecurityErrorFallbackProps {
  error: Error;
  retry: () => void;
  securityLevel: 'low' | 'medium' | 'high';
}

interface SecurityErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  securityLevel: 'low' | 'medium' | 'high';
  retryCount: number;
}

class SecurityErrorBoundary extends Component<SecurityErrorBoundaryProps, SecurityErrorBoundaryState> {
  constructor(props: SecurityErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      securityLevel: 'low',
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<SecurityErrorBoundaryState> {
    // Determine security level based on error type
    let securityLevel: 'low' | 'medium' | 'high' = 'low';
    
    const errorMessage = error.message.toLowerCase();
    if (errorMessage.includes('csrf') || errorMessage.includes('unauthorized')) {
      securityLevel = 'high';
    } else if (errorMessage.includes('rate limit') || errorMessage.includes('validation')) {
      securityLevel = 'medium';
    }

    return {
      hasError: true,
      error,
      securityLevel
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🛡️ Security Error Boundary caught an error:', error, errorInfo);
    
    // Report security violations
    if (this.props.onSecurityViolation) {
      this.props.onSecurityViolation(error, errorInfo);
    }

    // Log security events for monitoring
    const securityEvent = {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack,
      securityLevel: this.state.securityLevel,
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.warn('🔒 Security Event Logged:', securityEvent);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return (
          <FallbackComponent
            error={this.state.error!}
            retry={this.handleRetry}
            securityLevel={this.state.securityLevel}
          />
        );
      }

      return <DefaultSecurityErrorFallback 
        error={this.state.error!} 
        retry={this.handleRetry}
        securityLevel={this.state.securityLevel}
      />;
    }

    return this.props.children;
  }
}

const DefaultSecurityErrorFallback: React.FC<SecurityErrorFallbackProps> = ({ 
  error, 
  retry, 
  securityLevel 
}) => {
  const getSecurityIcon = () => {
    switch (securityLevel) {
      case 'high':
        return <Shield className="h-8 w-8 text-red-600" />;
      case 'medium':
        return <AlertTriangle className="h-8 w-8 text-yellow-600" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-blue-600" />;
    }
  };

  const getSecurityMessage = () => {
    switch (securityLevel) {
      case 'high':
        return {
          title: 'Security Alert',
          description: 'A security violation was detected. Please refresh the page and try again.',
          action: 'This incident has been logged for review.'
        };
      case 'medium':
        return {
          title: 'Security Warning',
          description: 'Your request was blocked for security reasons.',
          action: 'Please wait a moment before trying again.'
        };
      default:
        return {
          title: 'Security Check',
          description: 'A security check failed. This is likely a temporary issue.',
          action: 'Click retry to continue.'
        };
    }
  };

  const message = getSecurityMessage();

  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-2">
            {getSecurityIcon()}
          </div>
          <CardTitle className="text-xl">{message.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-muted-foreground">{message.description}</p>
          <p className="text-sm text-muted-foreground">{message.action}</p>
          
          {securityLevel !== 'high' && (
            <Button onClick={retry} className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}
          
          {securityLevel === 'high' && (
            <Button 
              onClick={() => window.location.reload()} 
              variant="destructive" 
              className="w-full"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
          )}
          
          <details className="text-left">
            <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
              Technical Details
            </summary>
            <pre className="text-xs mt-2 p-2 bg-muted rounded text-muted-foreground overflow-auto max-h-32">
              {error.message}
            </pre>
          </details>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityErrorBoundary;
