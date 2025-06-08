
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
}

interface EnhancedErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<{ 
    error?: Error; 
    retry: () => void; 
    goHome: () => void;
    onReport?: () => void;
    retryCount?: number;
    maxRetries?: number;
  }>;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableReporting?: boolean;
}

class EnhancedErrorBoundary extends Component<EnhancedErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: EnhancedErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('🚨 Enhanced ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    // Show toast notification
    toast.error('Something went wrong. Please try refreshing the page.');
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      toast.error(`Maximum retry attempts (${maxRetries}) reached. Please refresh the page.`);
      return;
    }

    console.log(`🔄 Retrying... Attempt ${retryCount + 1}/${maxRetries}`);
    
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: retryCount + 1 
    });

    // Add a small delay before retry
    this.retryTimeoutId = setTimeout(() => {
      toast.success('Retrying...');
    }, 100);
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    
    // In a real app, this would send to an error reporting service
    console.log('📋 Error Report:', {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    toast.success('Error report sent. Thank you for helping us improve!');
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error} 
          retry={this.handleRetry}
          goHome={this.handleGoHome}
          onReport={this.props.enableReporting ? this.handleReportError : undefined}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
        />
      );
    }

    return this.props.children;
  }
}

interface DefaultErrorFallbackProps {
  error?: Error;
  retry: () => void;
  goHome: () => void;
  onReport?: () => void;
  retryCount?: number;
  maxRetries?: number;
}

const DefaultErrorFallback: React.FC<DefaultErrorFallbackProps> = ({ 
  error, 
  retry, 
  goHome, 
  onReport,
  retryCount = 0,
  maxRetries = 3 
}) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
    <Card className="w-full max-w-lg border-red-200 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <CardTitle className="text-xl text-red-900">Something went wrong</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-red-700 mb-2">
            We're sorry, but an unexpected error occurred.
          </p>
          {error && (
            <details className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                Technical Details
              </summary>
              <pre className="mt-2 text-xs text-red-700 whitespace-pre-wrap break-words">
                {error.message}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={retry} 
            className="w-full gap-2"
            disabled={retryCount >= maxRetries}
            variant={retryCount >= maxRetries ? "secondary" : "default"}
          >
            <RefreshCw className="h-4 w-4" />
            {retryCount >= maxRetries 
              ? `Max retries reached (${retryCount}/${maxRetries})`
              : `Try Again (${retryCount}/${maxRetries})`
            }
          </Button>
          
          <Button onClick={goHome} variant="outline" className="w-full gap-2">
            <Home className="h-4 w-4" />
            Go to Dashboard
          </Button>

          {onReport && (
            <Button onClick={onReport} variant="ghost" size="sm" className="gap-2">
              <Bug className="h-4 w-4" />
              Report This Error
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default EnhancedErrorBoundary;
