
import React, { Component, ReactNode } from 'react';
import { productionErrorTracker } from '@/services/errorTracking/ProductionErrorTracker';
import { userSessionTracker } from '@/services/analytics/UserSessionTracker';
import { logger } from '@/services/logging/ProductionLogger';
import EnhancedErrorBoundary from './EnhancedErrorBoundary';

interface ProductionErrorBoundaryProps {
  children: ReactNode;
  componentName?: string;
  fallback?: React.ComponentType<{ 
    error?: Error; 
    retry: () => void; 
    goHome: () => void;
  }>;
}

interface ProductionErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ProductionErrorBoundary extends Component<
  ProductionErrorBoundaryProps, 
  ProductionErrorBoundaryState
> {
  constructor(props: ProductionErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): Partial<ProductionErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { componentName = 'Unknown' } = this.props;
    
    // Track error in production monitoring
    productionErrorTracker.trackError(error, {
      component: componentName,
      action: 'component_error',
      props: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });

    // Track error in user session
    userSessionTracker.trackError(componentName, error.message);

    // Log error with context - fix the logger call signature
    logger.error('React Error Boundary caught error', error);

    // Store error info
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    const { componentName = 'Unknown' } = this.props;
    
    // Track retry attempt
    userSessionTracker.trackInteraction('error_boundary_retry', {
      component: componentName,
      error: this.state.error?.message,
    });

    logger.info('User retried after error boundary', {
      component: componentName,
      error: this.state.error?.message,
    });

    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Use the enhanced error boundary for UI, but we've added production tracking
      return (
        <EnhancedErrorBoundary
          fallback={this.props.fallback}
          maxRetries={3}
          enableReporting={true}
          onError={(error, errorInfo) => {
            // This is already handled in componentDidCatch, but kept for compatibility
          }}
        >
          {this.props.children}
        </EnhancedErrorBoundary>
      );
    }

    return this.props.children;
  }
}
