
import { supabase } from '@/integrations/supabase/client';

/**
 * Cleans up all auth-related storage items to prevent auth state issues
 */
export const cleanupAuthState = () => {
  // Remove standard auth tokens
  localStorage.removeItem('supabase.auth.token');
  
  // Remove all Supabase auth keys from localStorage
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      localStorage.removeItem(key);
    }
  });
  
  // Remove from sessionStorage if in use
  Object.keys(sessionStorage || {}).forEach((key) => {
    if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
      sessionStorage.removeItem(key);
    }
  });
};

/**
 * Signs out the user and cleans up auth state
 */
export const signOutAndCleanup = async (navigate: (path: string) => void) => {
  try {
    cleanupAuthState();
    
    // Attempt global sign out
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (error) {
      console.error("Error during sign out:", error);
    }
    
    // Navigate to login page
    navigate('/login');
  } catch (error) {
    console.error("Error during sign out cleanup:", error);
  }
};
