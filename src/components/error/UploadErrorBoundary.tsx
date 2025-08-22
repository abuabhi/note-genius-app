import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface UploadErrorBoundaryProps {
  children: ReactNode;
  onReset?: () => void;
}

interface UploadErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class UploadErrorBoundary extends Component<UploadErrorBoundaryProps, UploadErrorBoundaryState> {
  constructor(props: UploadErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): UploadErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('❌ [UPLOAD ERROR BOUNDARY] Upload error caught:', error, errorInfo);
    
    // Log to analytics if available
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: `Upload Error: ${error.message}`,
        fatal: false
      });
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    this.props.onReset?.();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="m-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription className="mt-2">
            <p className="mb-3">
              Something went wrong during the file upload process. This might be due to:
            </p>
            <ul className="list-disc list-inside text-sm space-y-1 mb-4">
              <li>Large file size or corrupted file</li>
              <li>Network connectivity issues</li>
              <li>Browser compatibility problems</li>
              <li>Interrupted file reading process</li>
            </ul>
            <Button onClick={this.handleReset} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}