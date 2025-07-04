
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
    
    // Check for signup completion flag for tier-selection access
    const signupInfo = sessionStorage.getItem('signup_completed');
    let hasRecentSignup = false;
    
    if (signupInfo) {
      try {
        const parsed = JSON.parse(signupInfo);
        hasRecentSignup = Date.now() - parsed.timestamp < 10 * 60 * 1000; // Valid for 10 minutes
      } catch (error) {
        // Invalid signup info, clear it
        sessionStorage.removeItem('signup_completed');
      }
    }
    
    // Allow access to tier-selection/payment if user just signed up
    if (!user && !hasRecentSignup && !isPublicRoute) {
      console.log('🚦 [AUTH REDIRECTS] Redirecting unauthenticated user to login');
      navigate('/login', { replace: true });
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
  }, [user, onboardingCompleted, onboardingLoading, navigate, location.pathname, loading, isPublicRoute]);
};
