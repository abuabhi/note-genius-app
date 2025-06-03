
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useRouteEffects = () => {
  const location = useLocation();

  // Store current path in localStorage when path changes 
  useEffect(() => {
    if (location.pathname !== '/login' && location.pathname !== '/signup') {
      localStorage.setItem("lastVisitedPage", location.pathname);
    }
    // Always scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);
};
