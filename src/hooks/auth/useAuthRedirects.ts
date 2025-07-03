
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
    console.log('🚦 [AUTH REDIRECTS] State:', { 
      userId: user?.id,
      loading, 
      onboardingLoading, 
      onboardingCompleted, 
      currentPath: location.pathname 
    });
    
    // Skip redirection while still loading
    if (loading || onboardingLoading) {
      console.log('🚦 [AUTH REDIRECTS] Skipping redirects - still loading');
      return;
    }
    
    // Only redirect if user exists and we know their onboarding status
    if (user && onboardingCompleted !== null) {
      // Handle onboarding redirection
      if (onboardingCompleted === false) {
        // Only redirect if user is not already on onboarding page 
        // and not on pages that don't require onboarding
        if (!location.pathname.includes('/onboarding') &&
            !location.pathname.includes('/login') && 
            !location.pathname.includes('/signup') &&
            !isPublicRoute) {
          console.log('🚦 [AUTH REDIRECTS] Redirecting to onboarding - not completed');
          navigate('/onboarding', { replace: true });
        }
      } else if (onboardingCompleted === true && location.pathname === '/onboarding') {
        // If onboarding is complete and user is on onboarding page, redirect to dashboard
        console.log('🚦 [AUTH REDIRECTS] Redirecting to dashboard - onboarding completed');
        navigate('/dashboard', { replace: true });
      }
    }
    // We don't redirect non-authenticated users on public routes
  }, [user, onboardingCompleted, onboardingLoading, navigate, location.pathname, loading, isPublicRoute]);
};
