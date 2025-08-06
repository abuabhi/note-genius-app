import { lazy } from 'react';

// Lazy load admin components for better performance
export const LazyAnalyticsDashboard = lazy(() => 
  import('./analytics/AnalyticsDashboard').then(module => ({ 
    default: module.AnalyticsDashboard 
  }))
);

export const LazyProductionHealthDashboard = lazy(() => 
  import('./monitoring/ProductionHealthDashboard').then(module => ({ 
    default: module.ProductionHealthDashboard 
  }))
);

export const LazyInfluencerManagementTable = lazy(() => 
  import('./influencers/InfluencerManagementTable').then(module => ({ 
    default: module.InfluencerManagementTable 
  }))
);

// UserManagementTable - check if this component exists
// Remove this export if the component doesn't exist yet