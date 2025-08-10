
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { useUserProgressState } from '@/hooks/useUserProgressState';
import { NewUserDashboard } from './NewUserDashboard';
import { IntermediateDashboard } from './IntermediateDashboard';
import { AdvancedDashboard } from './AdvancedDashboard';
import ErrorBoundary from '@/components/common/ErrorBoundary';

export const ProgressiveDashboard = () => {
  const { user, loading } = useAuth();
  const progressState = useUserProgressState();

  if (loading || progressState.isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via auth hooks
  }

  return (
    <ErrorBoundary label="/dashboard">
      {/* Render different dashboard layouts based on user progress */}
      {(() => {
        switch (progressState.userType) {
          case 'new':
            return <NewUserDashboard progressState={progressState} />;
          case 'intermediate':
            return <IntermediateDashboard progressState={progressState} />;
          case 'advanced':
            return <AdvancedDashboard progressState={progressState} />;
          default:
            return <NewUserDashboard progressState={progressState} />;
        }
      })()}
    </ErrorBoundary>
  );
};
