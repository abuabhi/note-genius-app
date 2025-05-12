
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

export const addNoteToDatabase = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
  try {
    // First, insert the note
    const { data: noteInsertData, error: noteError } = await supabase
      .from('notes')
      .insert({
        title: noteData.title,
        description: noteData.description,
        date: noteData.date,
        category: noteData.category,
        content: noteData.content,
        source_type: noteData.sourceType,
        archived: noteData.archived || false,
        pinned: noteData.pinned || false,
        summary: noteData.summary,
        summary_generated_at: noteData.summary_generated_at,
        summary_status: noteData.summary_status || 'generating', // Default to generating to auto-trigger summary
        subject_id: noteData.subject_id
      })
      .select()
      .single();

    if (noteError) {
      throw noteError;
    }

    // Create a new note object with the inserted data
    const newNote: Note = {
      id: noteInsertData.id,
      title: noteInsertData.title,
      description: noteInsertData.description,
      date: new Date(noteInsertData.date).toISOString().split('T')[0],
      category: noteInsertData.category,
      content: noteInsertData.content,
      sourceType: noteInsertData.source_type as 'manual' | 'scan' | 'import',
      archived: noteInsertData.archived || false,
      pinned: noteInsertData.pinned || false,
      tags: noteData.tags || [],
      summary: noteInsertData.summary,
      summary_generated_at: noteInsertData.summary_generated_at,
      summary_status: noteInsertData.summary_status as 'pending' | 'generating' | 'completed' | 'failed',
      subject_id: noteInsertData.subject_id,
      scanData: noteData.sourceType === 'scan' && noteData.scanData ? {
        originalImageUrl: noteData.scanData.originalImageUrl,
        recognizedText: noteData.scanData.recognizedText,
        confidence: noteData.scanData.confidence,
        language: noteData.scanData.language
      } : undefined,
      importData: noteData.sourceType === 'import' && noteData.importData ? {
        originalFileUrl: noteData.importData.originalFileUrl,
        fileType: noteData.importData.fileType,
        importedAt: noteData.importData.importedAt
      } : undefined
    };
    
    return newNote;
  } catch (error) {
    console.error('Error adding note:', error);
    return null;
  }
};

export const deleteNoteFromDatabase = async (id: string): Promise<void> => {
  try {
    console.log("Attempting to delete note with ID:", id);
    
    // First attempt direct deletion with proper error handling
    const { error: directDeleteError } = await supabase
      .from('notes')
      .delete()
      .eq('id', id);
      
    if (directDeleteError) {
      console.warn('Direct delete failed, attempting to use edge function:', directDeleteError);
      
      // If direct delete fails, try using the edge function
      const { error: edgeFunctionError } = await supabase.functions.invoke('delete-note', {
        body: { noteId: id }
      });

      if (edgeFunctionError) {
        console.error('Edge function delete error:', edgeFunctionError);
        throw edgeFunctionError;
      } else {
        console.log("Note deleted successfully via edge function");
      }
    } else {
      console.log("Note deleted successfully via direct deletion");
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const updateNoteInDatabase = async (id: string, updatedNote: Partial<Note>): Promise<void> => {
  // Prepare the note data for update
  const noteUpdateData: any = {};
  if (updatedNote.title !== undefined) noteUpdateData.title = updatedNote.title;
  if (updatedNote.description !== undefined) noteUpdateData.description = updatedNote.description;
  if (updatedNote.date !== undefined) noteUpdateData.date = updatedNote.date;
  if (updatedNote.category !== undefined) noteUpdateData.category = updatedNote.category;
  if (updatedNote.content !== undefined) noteUpdateData.content = updatedNote.content;
  if (updatedNote.sourceType !== undefined) noteUpdateData.source_type = updatedNote.sourceType;
  if (updatedNote.archived !== undefined) noteUpdateData.archived = updatedNote.archived;
  if (updatedNote.pinned !== undefined) noteUpdateData.pinned = updatedNote.pinned;
  if (updatedNote.summary !== undefined) noteUpdateData.summary = updatedNote.summary;
  if (updatedNote.summary_generated_at !== undefined) noteUpdateData.summary_generated_at = updatedNote.summary_generated_at;
  if (updatedNote.summary_status !== undefined) noteUpdateData.summary_status = updatedNote.summary_status;
  if (updatedNote.subject_id !== undefined) noteUpdateData.subject_id = updatedNote.subject_id;

  if (Object.keys(noteUpdateData).length > 0) {
    const { error: noteError } = await supabase
      .from('notes')
      .update(noteUpdateData)
      .eq('id', id);

    if (noteError) {
      throw noteError;
    }
  }
};
