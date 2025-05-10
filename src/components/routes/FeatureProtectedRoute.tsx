
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useFeatures } from '@/contexts/FeatureContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, EyeOff } from 'lucide-react';
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
  const { isFeatureEnabled, isFeatureVisible } = useFeatures();
  
  // If the feature is not visible, redirect to fallback
  if (!isFeatureVisible(featureKey)) {
    return <Navigate to={fallbackPath} replace />;
  }
  
  // If feature is visible but disabled, let the FeatureDisabledAlert handle it
  return <>{children}</>;
};

export const FeatureDisabledAlert: React.FC<{
  featureKey: string;
  featureDisplayName: string;
}> = ({ featureKey, featureDisplayName }) => {
  const { isFeatureEnabled, isFeatureVisible } = useFeatures();
  
  // If feature is enabled OR not visible, don't show an alert
  if (isFeatureEnabled(featureKey) || !isFeatureVisible(featureKey)) return null;
  
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

// Higher-order component wrapper for feature-protected pages
export const withFeatureProtection = (
  Component: React.ComponentType, 
  featureKey: string, 
  featureDisplayName: string
) => {
  return (props: any) => {
    const { isFeatureVisible } = useFeatures();
    
    if (!isFeatureVisible(featureKey)) {
      return <Navigate to="/dashboard" replace />;
    }
    
    return (
      <>
        <FeatureDisabledAlert featureKey={featureKey} featureDisplayName={featureDisplayName} />
        <Component {...props} />
      </>
    );
  };
};
