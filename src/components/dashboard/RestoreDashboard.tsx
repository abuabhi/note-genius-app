
import React from 'react';
import { ProgressiveDashboard } from './progressive/ProgressiveDashboard';
import { WelcomeModal } from './modals/WelcomeModal';

export const RestoreDashboard = () => {
  return (
    <>
      <ProgressiveDashboard />
      <WelcomeModal />
    </>
  );
};
