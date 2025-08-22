import React from 'react';
import { useNavigate } from 'react-router-dom';
import EnhancedErrorBoundary from './EnhancedErrorBoundary';

interface EnhancedErrorBoundaryWithRouterProps {
  children: React.ReactNode;
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

export const EnhancedErrorBoundaryWithRouter: React.FC<EnhancedErrorBoundaryWithRouterProps> = (props) => {
  const navigate = useNavigate();
  
  return (
    <EnhancedErrorBoundary
      {...props}
      navigate={navigate}
    />
  );
};

export default EnhancedErrorBoundaryWithRouter;