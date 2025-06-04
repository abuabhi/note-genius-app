
import { publicRoutes, RouteConfig } from './publicRoutes';
import { standardRoutes } from './standardRoutes';
import { featureProtectedRoutes } from './featureProtectedRoutes';
import { adminRoutes } from './adminRoutes';
import { authCallbackRoutes } from './authCallbackRoutes';
import { miscRoutes } from './miscRoutes';

// Export the RouteConfig interface for other files
export type { RouteConfig };

// Re-export all route arrays for backward compatibility
export {
  publicRoutes,
  standardRoutes,
  featureProtectedRoutes,
  adminRoutes,
  authCallbackRoutes,
  miscRoutes,
};

// All routes combined
export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...standardRoutes,
  ...featureProtectedRoutes,
  ...adminRoutes,
  ...authCallbackRoutes,
  ...miscRoutes,
];
