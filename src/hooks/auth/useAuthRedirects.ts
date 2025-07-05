
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
  const publicRoutes = ['/', '/about', '/pricing', '/faq', '/contact', '/blog', '/features', '/login', '/signup', '/tier-selection', '/payment'];
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
    
    // Redirect unauthenticated users to login (except for public routes)
    if (!user && !isPublicRoute) {
      console.log('🚦 [AUTH REDIRECTS] Redirecting unauthenticated user to login');
      navigate('/login', { replace: true });
      return;
    }
    
    // Handle authenticated user redirects
    if (user && onboardingCompleted !== null) {
      if (onboardingCompleted === false) {
        // Redirect to onboarding if not completed (except for public routes)
        if (!location.pathname.includes('/onboarding') && !isPublicRoute) {
          console.log('🚦 [AUTH REDIRECTS] Redirecting to onboarding - not completed');
          navigate('/onboarding', { replace: true });
        }
      } else if (onboardingCompleted === true && location.pathname === '/onboarding') {
        // If onboarding is complete and user is on onboarding page, redirect to dashboard
        console.log('🚦 [AUTH REDIRECTS] Redirecting to dashboard - onboarding completed');
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, onboardingCompleted, onboardingLoading, navigate, location.pathname, loading, isPublicRoute]);
};
