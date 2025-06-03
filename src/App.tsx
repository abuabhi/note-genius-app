
import React from 'react';
import { AppProviders } from '@/components/app/AppProviders';
import { AppRoutes } from '@/components/app/AppRoutes';
import { useRouteEffects } from '@/hooks/useRouteEffects';

const App = () => {
  useRouteEffects();

  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
};

export default App;
