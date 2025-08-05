import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface AuthCallbackErrorBoundaryProps {
  children: React.ReactNode;
}

export class AuthCallbackErrorBoundary extends React.Component<
  AuthCallbackErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: AuthCallbackErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    console.error('🚨 [AUTH CALLBACK ERROR BOUNDARY] Error caught:', error);
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('🚨 [AUTH CALLBACK ERROR BOUNDARY] Component did catch:', {
      error: error.message,
      stack: error.stack,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-white">
          <div className="text-center p-8 max-w-md">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
            <p className="text-gray-600 text-sm mb-4">
              Something went wrong during the authentication process.
            </p>
            <p className="text-gray-400 text-xs">
              Error: {this.state.error?.message || 'Unknown error'}
            </p>
            <button 
              onClick={() => window.close()} 
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}