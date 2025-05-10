
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

export async function authenticateUser(
  authHeader: string | null,
  supabaseUrl: string,
  supabaseAnonKey: string
): Promise<string> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Missing or invalid authorization header');
  }
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data, error } = await supabase.auth.getUser(token);
  
  if (error || !data.user) {
    throw new Error(`Authentication failed: ${error?.message || 'Unknown error'}`);
  }
  
  return data.user.id;
}
