import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorBoundary } from './ErrorBoundary';

interface ErrorBoundaryWithRouterProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{
    error?: Error;
    retry: () => void;
    goHome: () => void;
  }>;
}

export const ErrorBoundaryWithRouter: React.FC<ErrorBoundaryWithRouterProps> = (props) => {
  const navigate = useNavigate();
  
  return (
    <ErrorBoundary
      {...props}
      navigate={navigate}
    />
  );
};

export default ErrorBoundaryWithRouter;