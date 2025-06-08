
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { FlashcardsErrorFallback } from '@/components/error/FlashcardsErrorFallback';

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    retry: () => void;
    goHome: () => void;
  }>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Flashcards Error Boundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || FlashcardsErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          retry={this.handleRetry}
          goHome={this.handleGoHome}
        />
      );
    }

    return this.props.children;
  }
}
