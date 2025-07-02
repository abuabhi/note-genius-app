
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('🚨 [ERROR BOUNDARY] Error caught:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 [ERROR BOUNDARY] Component stack:', errorInfo.componentStack);
    console.error('🚨 [ERROR BOUNDARY] Error details:', error);
    
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      console.log('🚨 [ERROR BOUNDARY] Rendering error fallback');
      
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🚨</div>
              <h1 className="text-xl font-bold text-red-600 mb-2">
                Dashboard Error Detected
              </h1>
              <p className="text-gray-600 mb-4">
                Something went wrong while loading the dashboard.
              </p>
              
              {this.state.error && (
                <div className="bg-gray-100 p-4 rounded-lg text-left mb-4">
                  <h3 className="font-semibold text-sm mb-2">Error Details:</h3>
                  <p className="text-xs text-red-600 font-mono">
                    {this.state.error.message}
                  </p>
                </div>
              )}
              
              <button
                onClick={() => window.location.reload()}
                className="bg-mint-500 text-white px-4 py-2 rounded hover:bg-mint-600"
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
