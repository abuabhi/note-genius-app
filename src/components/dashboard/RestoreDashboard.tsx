
import React from 'react';
import { ProgressiveDashboard } from './progressive/ProgressiveDashboard';
import { WelcomeModal } from './modals/WelcomeModal';
import { AnalyticsProvider } from '@/contexts/analytics/AnalyticsProvider';

export const RestoreDashboard = () => {
  return (
    <AnalyticsProvider>
      <ProgressiveDashboard />
      <WelcomeModal />
    </AnalyticsProvider>
  );
};
