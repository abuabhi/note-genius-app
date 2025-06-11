
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures a subject exists in user_subjects table and returns its ID
 */
export const ensureUserSubjectExists = async (subjectName: string, userId: string): Promise<string | null> => {
  if (!subjectName || !userId) {
    console.error('Missing subjectName or userId');
    return null;
  }

  try {
    console.log('Ensuring subject exists:', { subjectName, userId });

    // First, check if the subject already exists for this user
    const { data: existingSubject, error: fetchError } = await supabase
      .from('user_subjects')
      .select('id')
      .eq('user_id', userId)
      .eq('name', subjectName)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error checking existing subject:', fetchError);
      return null;
    }

    if (existingSubject) {
      console.log('Subject already exists:', existingSubject.id);
      return existingSubject.id;
    }

    // Subject doesn't exist, create it
    console.log('Creating new subject:', subjectName);
    const { data: newSubject, error: createError } = await supabase
      .from('user_subjects')
      .insert({
        user_id: userId,
        name: subjectName
      })
      .select('id')
      .single();

    if (createError) {
      console.error('Error creating subject:', createError);
      return null;
    }

    console.log('Successfully created subject:', newSubject.id);
    return newSubject.id;

  } catch (error) {
    console.error('Error in ensureUserSubjectExists:', error);
    return null;
  }
};

/**
 * Gets the subject ID for a given subject name, creating it if necessary
 */
export const getOrCreateSubjectId = async (subjectName: string): Promise<string | null> => {
  // Get current user
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id;

  if (!userId) {
    console.error('No authenticated user found');
    return null;
  }

  return await ensureUserSubjectExists(subjectName, userId);
};
