
import { publicRoutes, RouteConfig } from './publicRoutes';
import { standardRoutes } from './standardRoutes';
import { adminRoutes } from './adminRoutes';
import { authCallbackRoutes } from './authCallbackRoutes';
import { miscRoutes } from './miscRoutes';

// Export the RouteConfig interface for other files
export type { RouteConfig };

// Re-export all route arrays for backward compatibility
export {
  publicRoutes,
  standardRoutes,
  adminRoutes,
  authCallbackRoutes,
  miscRoutes,
};

// All routes combined - removed featureProtectedRoutes since all features are now permanently available
export const allRoutes: RouteConfig[] = [
  ...publicRoutes,
  ...standardRoutes,
  ...adminRoutes,
  ...authCallbackRoutes,
  ...miscRoutes,
];
