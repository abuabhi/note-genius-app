import { Routes, Route } from 'react-router-dom';

// This component is now deprecated as all routes are handled directly in AppRoutes.tsx
// Keeping it as a stub to avoid breaking any imports
export const OptimizedAppRoutes = () => {
  return (
    <Routes>
      <Route path="*" element={<div>Route not found</div>} />
    </Routes>
  );
};
