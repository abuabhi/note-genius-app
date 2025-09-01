import React, { Component, ReactNode } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { logger } from '@/utils/productionLogger';

interface AdvancedErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
  retryCount: number;
  isOffline: boolean;
  retryAttempting: boolean;
}

interface AdvancedErrorBoundaryProps {
  children: ReactNode;
  navigate?: NavigateFunction;
  fallback?: React.ComponentType<{ 
    error?: Error; 
    retry: () => void; 
    goHome: () => void;
    onReport?: () => void;
    retryCount?: number;
    maxRetries?: number;
    isOffline?: boolean;
    isRetrying?: boolean;
  }>;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  enableReporting?: boolean;
  enableOfflineDetection?: boolean;
  retryDelay?: number;
}

class AdvancedErrorBoundary extends Component<AdvancedErrorBoundaryProps, AdvancedErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private retryDelays = [1000, 2000, 4000, 8000]; // Exponential backoff

  constructor(props: AdvancedErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0,
      isOffline: false,
      retryAttempting: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<AdvancedErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidMount() {
    if (this.props.enableOfflineDetection) {
      window.addEventListener('online', this.handleOnline);
      window.addEventListener('offline', this.handleOffline);
      this.setState({ isOffline: !navigator.onLine });
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
    
    if (this.props.enableOfflineDetection) {
      window.removeEventListener('online', this.handleOnline);
      window.removeEventListener('offline', this.handleOffline);
    }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('Advanced ErrorBoundary caught an error:', error, errorInfo);
    
    this.setState({ errorInfo });
    
    // Call custom error handler
    this.props.onError?.(error, errorInfo);
    
    // Enhanced error classification
    const errorType = this.classifyError(error);
    
    // Show contextual toast notification
    if (errorType === 'network') {
      toast.error('Network error detected. Please check your connection.');
    } else if (errorType === 'chunk') {
      toast.error('App update detected. Refreshing...');
      // Auto-refresh for chunk load errors
      setTimeout(() => window.location.reload(), 2000);
    } else {
      toast.error('Something went wrong. We\'re working to fix it.');
    }

    // Send to error tracking service (Sentry, etc.)
    this.sendErrorToService(error, errorInfo, errorType);
  }

  classifyError(error: Error): 'network' | 'chunk' | 'render' | 'unknown' {
    const message = error.message.toLowerCase();
    
    if (message.includes('loading chunk') || message.includes('loading css chunk')) {
      return 'chunk';
    }
    
    if (message.includes('network') || message.includes('fetch')) {
      return 'network';
    }
    
    if (error.name === 'ChunkLoadError') {
      return 'chunk';
    }
    
    return 'render';
  }

  sendErrorToService(error: Error, errorInfo: React.ErrorInfo, errorType: string) {
    // In production, this would send to Sentry or similar service
    const errorReport = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorType,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      isOffline: !navigator.onLine,
      retryCount: this.state.retryCount
    };

    logger.error('Error report for tracking service:', errorReport);
  }

  handleOnline = () => {
    this.setState({ isOffline: false });
    if (this.state.hasError) {
      toast.success('Connection restored! You can try again now.');
    }
  };

  handleOffline = () => {
    this.setState({ isOffline: true });
    toast.error('You\'re offline. Some features may not work.');
  };

  handleRetry = async () => {
    const { maxRetries = 3 } = this.props;
    const { retryCount } = this.state;

    if (retryCount >= maxRetries) {
      toast.error(`Maximum retry attempts (${maxRetries}) reached. Please refresh the page.`);
      return;
    }

    // Check if offline before retrying
    if (!navigator.onLine) {
      toast.error('You\'re offline. Please check your connection and try again.');
      return;
    }

    this.setState({ retryAttempting: true });
    
    // Exponential backoff delay
    const delay = this.retryDelays[Math.min(retryCount, this.retryDelays.length - 1)];
    
    logger.progress(`Retrying... Attempt ${retryCount + 1}/${maxRetries} (delay: ${delay}ms)`);
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState({ 
        hasError: false, 
        error: undefined, 
        errorInfo: undefined,
        retryCount: retryCount + 1,
        retryAttempting: false
      });

      toast.success(`Retrying... (${retryCount + 1}/${maxRetries})`);
    }, delay);
  };

  handleGoHome = () => {
    if (this.props.navigate) {
      this.props.navigate('/dashboard');
    } else {
      window.location.href = '/dashboard';
    }
  };

  handleReportError = () => {
    const { error, errorInfo } = this.state;
    
    const report = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };
    
    logger.info('User-initiated error report:', report);
    
    // In production, send to support system
    toast.success('Error report sent. Thank you for helping us improve!');
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || AdvancedErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error} 
          retry={this.handleRetry}
          goHome={this.handleGoHome}
          onReport={this.props.enableReporting ? this.handleReportError : undefined}
          retryCount={this.state.retryCount}
          maxRetries={this.props.maxRetries || 3}
          isOffline={this.state.isOffline}
          isRetrying={this.state.retryAttempting}
        />
      );
    }

    return this.props.children;
  }
}

interface AdvancedErrorFallbackProps {
  error?: Error;
  retry: () => void;
  goHome: () => void;
  onReport?: () => void;
  retryCount?: number;
  maxRetries?: number;
  isOffline?: boolean;
  isRetrying?: boolean;
}

const AdvancedErrorFallback: React.FC<AdvancedErrorFallbackProps> = ({ 
  error, 
  retry, 
  goHome, 
  onReport,
  retryCount = 0,
  maxRetries = 3,
  isOffline = false,
  isRetrying = false
}) => {
  const getErrorMessage = () => {
    if (isOffline) {
      return "You're currently offline. Please check your internet connection and try again.";
    }
    
    if (error?.message.toLowerCase().includes('chunk')) {
      return "We've updated the app. Please refresh your browser to get the latest version.";
    }
    
    return "We're sorry, but an unexpected error occurred. Our team has been notified.";
  };

  const getActionButton = () => {
    if (isOffline) {
      return (
        <Button 
          onClick={retry} 
          className="w-full gap-2"
          disabled={isRetrying}
        >
          <Wifi className="h-4 w-4" />
          {isRetrying ? 'Checking connection...' : 'Try Again When Online'}
        </Button>
      );
    }

    return (
      <Button 
        onClick={retry} 
        className="w-full gap-2"
        disabled={retryCount >= maxRetries || isRetrying}
        variant={retryCount >= maxRetries ? "secondary" : "default"}
      >
        <RefreshCw className={cn("h-4 w-4", isRetrying && "animate-spin")} />
        {isRetrying 
          ? 'Retrying...'
          : retryCount >= maxRetries 
          ? `Max retries reached (${retryCount}/${maxRetries})`
          : `Try Again (${retryCount}/${maxRetries})`
        }
      </Button>
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
      <Card className="w-full max-w-lg border-red-200 shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            {isOffline ? (
              <Wifi className="h-8 w-8 text-red-600" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-red-600" />
            )}
          </div>
          <CardTitle className="text-xl text-red-900">
            {isOffline ? 'Connection Lost' : 'Something went wrong'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-red-700 mb-2">
              {getErrorMessage()}
            </p>
            
            {error && !isOffline && (
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
            {getActionButton()}
            
            <Button onClick={goHome} variant="outline" className="w-full gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Button>

            {onReport && !isOffline && (
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
};

export default AdvancedErrorBoundary;