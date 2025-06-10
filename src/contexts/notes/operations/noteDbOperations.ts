
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
        subject: noteData.category, // Map category to subject column
        content: noteData.content,
        source_type: noteData.sourceType,
        archived: noteData.archived || false,
        pinned: noteData.pinned || false,
        summary: noteData.summary,
        summary_generated_at: noteData.summary_generated_at,
        summary_status: noteData.summary_status || 'pending',
        key_points: noteData.key_points,
        key_points_generated_at: noteData.key_points_generated_at,
        markdown_content: noteData.markdown_content,
        markdown_content_generated_at: noteData.markdown_content_generated_at,
        improved_content: noteData.improved_content,
        improved_content_generated_at: noteData.improved_content_generated_at,
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
      category: noteInsertData.subject, // Map subject column back to category in our app model
      content: noteInsertData.content,
      sourceType: noteInsertData.source_type as 'manual' | 'scan' | 'import',
      archived: noteInsertData.archived || false,
      pinned: noteInsertData.pinned || false,
      tags: noteData.tags || [],
      summary: noteInsertData.summary,
      summary_generated_at: noteInsertData.summary_generated_at,
      summary_status: noteInsertData.summary_status as 'pending' | 'generating' | 'completed' | 'failed',
      key_points: noteInsertData.key_points,
      key_points_generated_at: noteInsertData.key_points_generated_at,
      markdown_content: noteInsertData.markdown_content,
      markdown_content_generated_at: noteInsertData.markdown_content_generated_at,
      improved_content: noteInsertData.improved_content,
      improved_content_generated_at: noteInsertData.improved_content_generated_at,
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
    console.log("Starting delete note operation for ID:", id);
    
    // First, verify if the note exists and log its details
    const { data: noteData, error: checkError } = await supabase
      .from('notes')
      .select('*')  // Select all columns for better debugging
      .eq('id', id)
      .single();

    if (checkError) {
      console.log(`Note check error: ${checkError.message}`);
    } else {
      console.log(`Note to be deleted:`, noteData);
    }
    
    // Always use the edge function which handles related records properly
    const { data, error: edgeFunctionError } = await supabase.functions.invoke('delete-note', {
      body: { noteId: id }
    });

    if (edgeFunctionError) {
      console.error('Edge function delete error:', edgeFunctionError);
      throw edgeFunctionError;
    } else {
      console.log("Note deleted successfully via edge function", data);
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const updateNoteInDatabase = async (id: string, updatedNote: Partial<Note>): Promise<void> => {
  console.log('🔄 updateNoteInDatabase called with:', {
    id,
    fieldsToUpdate: Object.keys(updatedNote),
    enhancementFields: {
      summary: updatedNote.summary?.substring(0, 50) || 'none',
      key_points: updatedNote.key_points?.substring(0, 50) || 'none',
      improved_content: updatedNote.improved_content?.substring(0, 50) || 'none',
      markdown_content: updatedNote.markdown_content?.substring(0, 50) || 'none',
      enriched_content: updatedNote.enriched_content?.substring(0, 50) || 'none'
    }
  });

  // Prepare the note data for update - include ALL possible enhancement fields
  const noteUpdateData: any = {};
  if (updatedNote.title !== undefined) noteUpdateData.title = updatedNote.title;
  if (updatedNote.description !== undefined) noteUpdateData.description = updatedNote.description;
  if (updatedNote.date !== undefined) noteUpdateData.date = updatedNote.date;
  if (updatedNote.category !== undefined) noteUpdateData.subject = updatedNote.category; // Map category to subject column
  if (updatedNote.content !== undefined) noteUpdateData.content = updatedNote.content;
  if (updatedNote.sourceType !== undefined) noteUpdateData.source_type = updatedNote.sourceType;
  if (updatedNote.archived !== undefined) noteUpdateData.archived = updatedNote.archived;
  if (updatedNote.pinned !== undefined) noteUpdateData.pinned = updatedNote.pinned;
  if (updatedNote.subject_id !== undefined) noteUpdateData.subject_id = updatedNote.subject_id;

  // Enhancement fields
  if (updatedNote.summary !== undefined) noteUpdateData.summary = updatedNote.summary;
  if (updatedNote.summary_generated_at !== undefined) noteUpdateData.summary_generated_at = updatedNote.summary_generated_at;
  if (updatedNote.summary_status !== undefined) noteUpdateData.summary_status = updatedNote.summary_status;
  
  if (updatedNote.key_points !== undefined) noteUpdateData.key_points = updatedNote.key_points;
  if (updatedNote.key_points_generated_at !== undefined) noteUpdateData.key_points_generated_at = updatedNote.key_points_generated_at;
  
  if (updatedNote.markdown_content !== undefined) noteUpdateData.markdown_content = updatedNote.markdown_content;
  if (updatedNote.markdown_content_generated_at !== undefined) noteUpdateData.markdown_content_generated_at = updatedNote.markdown_content_generated_at;
  
  if (updatedNote.improved_content !== undefined) noteUpdateData.improved_content = updatedNote.improved_content;
  if (updatedNote.improved_content_generated_at !== undefined) noteUpdateData.improved_content_generated_at = updatedNote.improved_content_generated_at;

  // NEW: Enriched content fields
  if (updatedNote.enriched_content !== undefined) noteUpdateData.enriched_content = updatedNote.enriched_content;
  if (updatedNote.enriched_content_generated_at !== undefined) noteUpdateData.enriched_content_generated_at = updatedNote.enriched_content_generated_at;
  if (updatedNote.enriched_status !== undefined) noteUpdateData.enriched_status = updatedNote.enriched_status;

  console.log('📝 Database update payload:', {
    id,
    updateFields: Object.keys(noteUpdateData),
    enhancementData: {
      summary: noteUpdateData.summary?.substring(0, 50) || 'none',
      key_points: noteUpdateData.key_points?.substring(0, 50) || 'none',
      improved_content: noteUpdateData.improved_content?.substring(0, 50) || 'none',
      markdown_content: noteUpdateData.markdown_content?.substring(0, 50) || 'none',
      enriched_content: noteUpdateData.enriched_content?.substring(0, 50) || 'none'
    }
  });

  if (Object.keys(noteUpdateData).length > 0) {
    const { error: noteError } = await supabase
      .from('notes')
      .update(noteUpdateData)
      .eq('id', id);

    if (noteError) {
      console.error('❌ Database update failed:', noteError);
      throw noteError;
    }

    console.log('✅ Database update successful for note:', id);
  } else {
    console.log('⚠️ No fields to update for note:', id);
  }
};
