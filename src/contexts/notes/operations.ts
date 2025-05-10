
import { Note } from '@/types/note';
import { supabase } from '@/integrations/supabase/client';

/**
 * Add a new note to the database
 */
export const addNoteToDatabase = async (note: Omit<Note, 'id'>) => {
  const { data, error } = await supabase
    .from('notes')
    .insert(note)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Delete a note from the database
 */
export const deleteNoteFromDatabase = async (noteId: string) => {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', noteId);
    
  if (error) throw error;
  return true;
};

/**
 * Update a note in the database
 */
export const updateNoteInDatabase = async (noteId: string, updates: Partial<Note>) => {
  const { data, error } = await supabase
    .from('notes')
    .update(updates)
    .eq('id', noteId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

/**
 * Fetch all tags from the database
 */
export const fetchTagsFromDatabase = async () => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name');
    
  if (error) throw error;
  return data || [];
};

/**
 * Fetch note enrichment usage statistics
 */
export const fetchNoteEnrichmentUsage = async () => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  
  if (!userId) {
    throw new Error('No authenticated user found');
  }
  
  // Get current month in YYYY-MM format
  const currentMonth = new Date().toISOString().slice(0, 7);
  
  const { data, error } = await supabase
    .from('note_enrichment_usage')
    .select('id')
    .eq('user_id', userId)
    .eq('month_year', currentMonth);
  
  if (error) throw error;
  
  return data.length;
};
