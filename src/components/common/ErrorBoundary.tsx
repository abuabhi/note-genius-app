
import React from 'react';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  label?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log detailed info so we can pinpoint the exact component
    console.error('ErrorBoundary caught an error', {
      label: this.props.label,
      error,
      componentStack: errorInfo.componentStack,
    });
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback ?? (
        <div className="min-h-[200px] p-6 rounded-xl border bg-background">
          <div className="text-sm text-muted-foreground">
            Something went wrong{this.props.label ? ` in ${this.props.label}` : ''}. Please reload the page.
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
