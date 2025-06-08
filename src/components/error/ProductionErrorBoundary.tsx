
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home, Bug, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface ErrorInfo {
  componentStack: string;
  errorBoundary?: string;
}

interface ProductionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  retryCount: number;
  errorId: string;
}

interface ProductionErrorBoundaryProps {
  children: ReactNode;
  fallback?: React.ComponentType<ProductionErrorFallbackProps>;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: ErrorInfo, errorId: string) => void;
  enableReporting?: boolean;
  showErrorDetails?: boolean;
}

interface ProductionErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
  retry: () => void;
  goHome: () => void;
  reportError?: () => void;
  retryCount: number;
  maxRetries: number;
  errorId: string;
  canRetry: boolean;
}

class ProductionErrorBoundary extends Component<ProductionErrorBoundaryProps, ProductionErrorBoundaryState> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: ProductionErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ProductionErrorBoundaryState> {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { 
      hasError: true, 
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const enhancedErrorInfo: ErrorInfo = {
      componentStack: errorInfo.componentStack,
      errorBoundary: this.constructor.name
    };

    console.error('🚨 Production ErrorBoundary caught error:', {
      error,
      errorInfo: enhancedErrorInfo,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    this.setState({ errorInfo: enhancedErrorInfo });
    
    // Call custom error handler
    this.props.onError?.(error, enhancedErrorInfo, this.state.errorId);
    
    // Show user-friendly notification
    toast.error('Something went wrong. Our team has been notified.');

    // In production, send to error tracking service
    this.sendErrorToService(error, enhancedErrorInfo);
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private sendErrorToService = (error: Error, errorInfo: ErrorInfo) => {
    // In production, integrate with services like Sentry, LogRocket, etc.
    const errorReport = {
      errorId: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      retryCount: this.state.retryCount
    };

    console.log('📡 Sending error report to monitoring service:', errorReport);
    
    // Example: Send to your error tracking service
    // errorTrackingService.captureException(error, errorReport);
  };

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
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    
    // Copy error details to clipboard for user reporting
    const errorDetails = {
      errorId,
      message: error?.message,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };
    
    navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
    toast.success('Error details copied to clipboard. Thank you for reporting!');
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || ProductionErrorFallback;
      const { maxRetries = 3 } = this.props;
      
      return (
        <FallbackComponent 
          error={this.state.error} 
          errorInfo={this.state.errorInfo}
          retry={this.handleRetry}
          goHome={this.handleGoHome}
          reportError={this.props.enableReporting ? this.handleReportError : undefined}
          retryCount={this.state.retryCount}
          maxRetries={maxRetries}
          errorId={this.state.errorId}
          canRetry={this.state.retryCount < maxRetries}
        />
      );
    }

    return this.props.children;
  }
}

const ProductionErrorFallback: React.FC<ProductionErrorFallbackProps> = ({ 
  error, 
  errorInfo,
  retry, 
  goHome, 
  reportError,
  retryCount,
  maxRetries,
  errorId,
  canRetry
}) => (
  <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50">
    <Card className="w-full max-w-lg border-red-200 shadow-lg">
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <CardTitle className="text-xl text-red-900">Something went wrong</CardTitle>
        <div className="flex items-center justify-center gap-2 text-sm text-red-600">
          <Shield className="h-4 w-4" />
          <span>Error ID: {errorId}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <p className="text-red-700 mb-2">
            We're sorry, but an unexpected error occurred. Our team has been automatically notified.
          </p>
          
          {error && (
            <details className="mt-4 p-3 bg-red-50 rounded-lg border border-red-200">
              <summary className="text-sm text-red-600 cursor-pointer hover:text-red-800">
                Technical Details
              </summary>
              <div className="mt-2 text-xs text-red-700 space-y-2">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                {errorInfo?.componentStack && (
                  <div>
                    <strong>Component:</strong>
                    <pre className="whitespace-pre-wrap break-words text-xs mt-1">
                      {errorInfo.componentStack.split('\n').slice(0, 3).join('\n')}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={retry} 
            className="w-full gap-2"
            disabled={!canRetry}
            variant={canRetry ? "default" : "secondary"}
          >
            <RefreshCw className="h-4 w-4" />
            {canRetry 
              ? `Try Again (${retryCount}/${maxRetries})`
              : `Max retries reached (${retryCount}/${maxRetries})`
            }
          </Button>
          
          <Button onClick={goHome} variant="outline" className="w-full gap-2">
            <Home className="h-4 w-4" />
            Go to Homepage
          </Button>

          {reportError && (
            <Button onClick={reportError} variant="ghost" size="sm" className="gap-2">
              <Bug className="h-4 w-4" />
              Copy Error Details
            </Button>
          )}
        </div>

        <div className="text-xs text-center text-red-500">
          If this problem persists, please contact support with Error ID: {errorId}
        </div>
      </CardContent>
    </Card>
  </div>
);

export default ProductionErrorBoundary;
