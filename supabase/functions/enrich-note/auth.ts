
/**
 * Authenticates a user based on the JWT token from the request header
 * @param authHeader Authentication header containing the JWT token
 * @param supabaseUrl The Supabase project URL
 * @param supabaseAnonKey The Supabase anonymous key
 * @returns The authenticated user ID
 * @throws Error if authentication fails
 */
export async function authenticateUser(
  authHeader: string | null,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<string> {
  if (!authHeader) {
    throw new Error('Missing authorization header');
  }

  // Extract the JWT token from the authorization header
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    throw new Error('Invalid authorization header');
  }
  
  try {
    // Verify the JWT token by calling the Supabase auth API
    const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey
      }
    });
    
    if (!response.ok) {
      console.error('Auth verification failed:', await response.text());
      throw new Error('User not authenticated');
    }
    
    const user = await response.json();
    
    if (!user || !user.id) {
      throw new Error('User ID not found');
    }
    
    return user.id;
  } catch (error) {
    console.error('Error during authentication:', error);
    throw new Error('Authentication failed');
  }
}
