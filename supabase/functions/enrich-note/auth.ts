
/**
 * Authenticates a user based on the JWT token from the request header
 * @param authHeader Authentication header containing the JWT token
 * @param supabaseUrl The Supabase project URL
 * @param supabaseAnonKey The Supabase anonymous key
 * @returns The authenticated user data including tier
 * @throws Error if authentication fails
 */
export async function authenticateUser(
  authHeader: string | null,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<{success: boolean; user?: {id: string}; userTier?: string; error?: string}> {
  if (!authHeader) {
    return { success: false, error: 'Missing authorization header' };
  }

  // Extract the JWT token from the authorization header
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return { success: false, error: 'Invalid authorization header' };
  }
  
  try {
    // Verify the JWT token by calling the Supabase auth API
    const authResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey
      }
    });
    
    if (!authResponse.ok) {
      console.error('Auth verification failed:', await authResponse.text());
      return { success: false, error: 'User not authenticated' };
    }
    
    const user = await authResponse.json();
    
    if (!user || !user.id) {
      return { success: false, error: 'User ID not found' };
    }
    
    // Get user tier from profiles table
    const profileResponse = await fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${user.id}&select=user_tier`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey,
        'Content-Type': 'application/json'
      }
    });
    
    let userTier = 'SCHOLAR'; // Default tier
    if (profileResponse.ok) {
      const profiles = await profileResponse.json();
      if (profiles && profiles.length > 0 && profiles[0].user_tier) {
        userTier = profiles[0].user_tier;
      }
    }
    
    return { 
      success: true, 
      user: { id: user.id }, 
      userTier 
    };
  } catch (error) {
    console.error('Error during authentication:', error);
    return { success: false, error: 'Authentication failed' };
  }
}
