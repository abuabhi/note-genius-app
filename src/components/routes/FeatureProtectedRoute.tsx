
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFeature } from '@/contexts/FeatureContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import Layout from '@/components/layout/Layout';

interface FeatureProtectedRouteProps {
  featureKey: string;
  children: React.ReactNode;
  fallbackPath?: string;
}

export const FeatureProtectedRoute: React.FC<FeatureProtectedRouteProps> = ({ 
  featureKey, 
  children, 
  fallbackPath = '/dashboard' 
}) => {
  const isEnabled = useFeature(featureKey);
  
  if (!isEnabled) {
    // For direct navigation attempts, redirect to fallback
    return <Navigate to={fallbackPath} replace />;
  }
  
  return <>{children}</>;
};

export const FeatureDisabledAlert: React.FC<{
  featureKey: string;
  featureDisplayName: string;
}> = ({ featureKey, featureDisplayName }) => {
  const isEnabled = useFeature(featureKey);
  
  if (isEnabled) return null;
  
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Feature Unavailable</AlertTitle>
      <AlertDescription>
        The {featureDisplayName} feature is currently unavailable. 
        This feature may be disabled or requires a higher subscription tier.
      </AlertDescription>
    </Alert>
  );
};
