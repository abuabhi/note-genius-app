
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { DEBUG_CONFIG } from '@/config/debug';

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
  
  // Define which routes are public (case-insensitive) and prefixes for dynamic public paths
  const normalizedPath = location.pathname.toLowerCase();
  const exactPublicPaths = new Set([
    '/', '/about', '/pricing', '/faq', '/help', '/help-center', '/help-centre',
    '/contact', '/blog', '/features', '/login', '/signup', '/tier-selection', '/payment',
    '/oauth2callback', '/auth/google-docs/callback', '/auth/evernote/callback', '/auth/notion/callback', '/auth/microsoft/callback',
    '/privacy', '/terms'
  ]);
  const publicPrefixes = ['/coupon/', '/auth/'];
  const isPublicRoute = exactPublicPaths.has(normalizedPath) || publicPrefixes.some(prefix => normalizedPath.startsWith(prefix));
  
  useEffect(() => {
    if (DEBUG_CONFIG.NAVIGATION_LOGGING) {
      console.log('🚦 [AUTH REDIRECTS] State:', { 
        userId: user?.id,
        loading, 
        onboardingLoading, 
        onboardingCompleted, 
        currentPath: location.pathname 
      });
    }
    
    // Skip redirection while still loading
    if (loading || onboardingLoading) {
      if (DEBUG_CONFIG.NAVIGATION_LOGGING) {
        console.log('🚦 [AUTH REDIRECTS] Skipping redirects - still loading');
      }
      return;
    }
    
    // Redirect unauthenticated users to login (except for public routes)
    if (!user && !isPublicRoute) {
      if (DEBUG_CONFIG.NAVIGATION_LOGGING) {
        console.log('🚦 [AUTH REDIRECTS] Redirecting unauthenticated user to login');
      }
      navigate('/login', { replace: true });
      return;
    }
    
    // Handle authenticated user redirects
    if (user && onboardingCompleted !== null) {
      if (onboardingCompleted === false) {
        // Redirect to onboarding if not completed (except for public routes)
        if (!location.pathname.includes('/onboarding') && !isPublicRoute) {
          if (DEBUG_CONFIG.NAVIGATION_LOGGING) {
            console.log('🚦 [AUTH REDIRECTS] Redirecting to onboarding - not completed');
          }
          navigate('/onboarding', { replace: true });
        }
      } else if (onboardingCompleted === true && location.pathname === '/onboarding') {
        // If onboarding is complete and user is on onboarding page, redirect to dashboard
        if (DEBUG_CONFIG.NAVIGATION_LOGGING) {
          console.log('🚦 [AUTH REDIRECTS] Redirecting to dashboard - onboarding completed');
        }
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, onboardingCompleted, onboardingLoading, navigate, location.pathname, loading, isPublicRoute]);
};
