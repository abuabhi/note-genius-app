
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface UseAuthRedirectsProps {
  user: any | null;
  onboardingCompleted: boolean | null;
  onboardingLoading: boolean;
  loading: boolean;
}

export const useAuthRedirects = ({
  user,
  onboardingCompleted,
  onboardingLoading,
  loading
}: UseAuthRedirectsProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Define which routes are public
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup'];
  const isPublicRoute = publicRoutes.includes(location.pathname);
  
  useEffect(() => {
    // Skip redirection while still loading
    if (loading || onboardingLoading) {
      return;
    }
    
    // Only redirect if user exists and we know their onboarding status
    if (user) {
      // Handle onboarding redirection
      if (onboardingCompleted === false) {
        // Only redirect if user is not already on onboarding page 
        // and not on pages that don't require onboarding
        if (!location.pathname.includes('/onboarding') &&
            !location.pathname.includes('/login') && 
            !location.pathname.includes('/signup')) {
          navigate('/onboarding');
        }
      } else if (onboardingCompleted === true && location.pathname === '/onboarding') {
        // If onboarding is complete and user is on onboarding page, redirect to dashboard
        navigate('/dashboard', { replace: true });
      }
    }
    // We don't redirect non-authenticated users on public routes
  }, [user, onboardingCompleted, onboardingLoading, navigate, location.pathname, loading]);
};
