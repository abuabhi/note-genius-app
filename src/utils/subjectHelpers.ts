
import { supabase } from "@/integrations/supabase/client";

/**
 * Ensures a subject exists in user_subjects table and returns its ID
 * Includes retry logic for better reliability
 */
export const ensureUserSubjectExists = async (subjectName: string, userId: string, retryCount = 3): Promise<string | null> => {
  if (!subjectName || !userId) {
    console.error('❌ SUBJECT_HELPER: Missing subjectName or userId');
    return null;
  }

  try {
    console.log(`🔍 SUBJECT_HELPER: Ensuring subject exists (attempt ${4 - retryCount}):`, { subjectName, userId });

    const trimmedSubjectName = subjectName.trim();

    // First, check if the subject already exists for this user
    const { data: existingSubject, error: fetchError } = await supabase
      .from('user_subjects')
      .select('id')
      .eq('user_id', userId)
      .eq('name', trimmedSubjectName)
      .maybeSingle(); // Use maybeSingle to avoid errors when not found

    if (fetchError) {
      console.error('❌ SUBJECT_HELPER: Error checking existing subject:', fetchError);
      if (retryCount > 1) {
        console.log(`🔄 SUBJECT_HELPER: Retrying fetch... (${retryCount - 1} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return ensureUserSubjectExists(subjectName, userId, retryCount - 1);
      }
      return null;
    }

    if (existingSubject) {
      console.log('✅ SUBJECT_HELPER: Subject already exists:', existingSubject.id);
      return existingSubject.id;
    }

    // Subject doesn't exist, create it
    console.log('🔨 SUBJECT_HELPER: Creating new subject:', trimmedSubjectName);
    const { data: newSubject, error: createError } = await supabase
      .from('user_subjects')
      .insert({
        user_id: userId,
        name: trimmedSubjectName
      })
      .select('id')
      .single();

    if (createError) {
      console.error('❌ SUBJECT_HELPER: Error creating subject:', createError);
      if (retryCount > 1) {
        console.log(`🔄 SUBJECT_HELPER: Retrying creation... (${retryCount - 1} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, 500));
        return ensureUserSubjectExists(subjectName, userId, retryCount - 1);
      }
      return null;
    }

    if (!newSubject?.id) {
      console.error('❌ SUBJECT_HELPER: Subject created but no ID returned');
      return null;
    }

    console.log('✅ SUBJECT_HELPER: Successfully created subject:', newSubject.id);
    return newSubject.id;

  } catch (error) {
    console.error(`❌ SUBJECT_HELPER: Error in ensureUserSubjectExists (attempt ${4 - retryCount}):`, error);
    if (retryCount > 1) {
      console.log(`🔄 SUBJECT_HELPER: Final retry... (${retryCount - 1} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return ensureUserSubjectExists(subjectName, userId, retryCount - 1);
    }
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
