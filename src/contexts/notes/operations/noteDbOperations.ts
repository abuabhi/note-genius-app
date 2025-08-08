
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
        subject: noteData.subject, // Map subject to subject column
        content: noteData.content,
        source_type: noteData.sourceType,
        archived: noteData.archived || false,
        pinned: noteData.pinned || false,
        summary: noteData.summary,
        summary_generated_at: noteData.summary_generated_at,
        summary_status: noteData.summary_status, // Only set if explicitly provided
        key_points: noteData.key_points,
        key_points_generated_at: noteData.key_points_generated_at,
        key_points_status: noteData.key_points_status, // Only set if explicitly provided
        markdown_content: noteData.markdown_content,
        markdown_content_generated_at: noteData.markdown_content_generated_at,
        markdown_content_status: noteData.markdown_content_status, // Only set if explicitly provided
        questions_content: noteData.questions_content,
        questions_generated_at: noteData.questions_generated_at,
        questions_status: noteData.questions_status, // Only set if explicitly provided
        enriched_content: noteData.enriched_content,
        enriched_content_generated_at: noteData.enriched_content_generated_at,
        enriched_status: noteData.enriched_status, // Only set if explicitly provided
        subject_id: noteData.subject_id,
        // YouTube-specific fields (persist if provided)
        video_url: noteData.video_url,
        video_metadata: noteData.video_metadata as any
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
      subject: noteInsertData.subject, // Map subject column back to subject in our app model
      content: noteInsertData.content,
      sourceType: noteInsertData.source_type as 'manual' | 'scan' | 'import' | 'youtube',
      archived: noteInsertData.archived || false,
      pinned: noteInsertData.pinned || false,
      tags: noteData.tags || [],
      summary: noteInsertData.summary,
      summary_generated_at: noteInsertData.summary_generated_at,
      summary_status: noteInsertData.summary_status as 'pending' | 'generating' | 'completed' | 'failed',
      key_points: noteInsertData.key_points,
      key_points_generated_at: noteInsertData.key_points_generated_at,
      key_points_status: noteInsertData.key_points_status as 'pending' | 'generating' | 'completed' | 'failed',
      markdown_content: noteInsertData.markdown_content,
      markdown_content_generated_at: noteInsertData.markdown_content_generated_at,
      markdown_content_status: noteInsertData.markdown_content_status as 'pending' | 'generating' | 'completed' | 'failed',
      questions_content: noteInsertData.questions_content,
      questions_generated_at: noteInsertData.questions_generated_at,
      questions_status: noteInsertData.questions_status as 'pending' | 'generating' | 'completed' | 'failed',
      enriched_content: noteInsertData.enriched_content,
      enriched_content_generated_at: noteInsertData.enriched_content_generated_at,
      enriched_status: noteInsertData.enriched_status as 'pending' | 'generating' | 'completed' | 'failed',
      subject_id: noteInsertData.subject_id,
      // YouTube-specific returned fields
      video_url: noteInsertData.video_url,
      video_metadata: noteInsertData.video_metadata as Note['video_metadata'],
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
    
    // Use the optimized database function that handles all foreign key constraints
    const { data, error } = await supabase.rpc('force_delete_note_optimized', {
      note_id_param: id
    });

    if (error) {
      console.error('Database function delete error:', error);
      throw error;
    }

    if (!data) {
      console.error('Delete operation failed - note may not exist:', id);
      throw new Error('Failed to delete note - note may not exist');
    }

    console.log("Note deleted successfully via database function:", id);
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
      questions_content: updatedNote.questions_content?.substring(0, 50) || 'none',
      markdown_content: updatedNote.markdown_content?.substring(0, 50) || 'none',
      enriched_content: updatedNote.enriched_content?.substring(0, 50) || 'none'
    }
  });

  // Prepare the note data for update - include ALL possible enhancement fields
  const noteUpdateData: any = {};
  if (updatedNote.title !== undefined) noteUpdateData.title = updatedNote.title;
  if (updatedNote.description !== undefined) noteUpdateData.description = updatedNote.description;
  if (updatedNote.date !== undefined) noteUpdateData.date = updatedNote.date;
  if (updatedNote.subject !== undefined) noteUpdateData.subject = updatedNote.subject; // Map subject to subject column
  if (updatedNote.content !== undefined) noteUpdateData.content = updatedNote.content;
  if (updatedNote.sourceType !== undefined) noteUpdateData.source_type = updatedNote.sourceType;
  if (updatedNote.archived !== undefined) noteUpdateData.archived = updatedNote.archived;
  if (updatedNote.pinned !== undefined) noteUpdateData.pinned = updatedNote.pinned;
  if (updatedNote.subject_id !== undefined) noteUpdateData.subject_id = updatedNote.subject_id;

  // Enhancement fields with comprehensive status tracking
  if (updatedNote.summary !== undefined) noteUpdateData.summary = updatedNote.summary;
  if (updatedNote.summary_generated_at !== undefined) noteUpdateData.summary_generated_at = updatedNote.summary_generated_at;
  if (updatedNote.summary_status !== undefined) noteUpdateData.summary_status = updatedNote.summary_status;
  
  if (updatedNote.key_points !== undefined) noteUpdateData.key_points = updatedNote.key_points;
  if (updatedNote.key_points_generated_at !== undefined) noteUpdateData.key_points_generated_at = updatedNote.key_points_generated_at;
  if (updatedNote.key_points_status !== undefined) noteUpdateData.key_points_status = updatedNote.key_points_status;
  
  if (updatedNote.markdown_content !== undefined) noteUpdateData.markdown_content = updatedNote.markdown_content;
  if (updatedNote.markdown_content_generated_at !== undefined) noteUpdateData.markdown_content_generated_at = updatedNote.markdown_content_generated_at;
  if (updatedNote.markdown_content_status !== undefined) noteUpdateData.markdown_content_status = updatedNote.markdown_content_status;
  
  if (updatedNote.questions_content !== undefined) noteUpdateData.questions_content = updatedNote.questions_content;
  if (updatedNote.questions_generated_at !== undefined) noteUpdateData.questions_generated_at = updatedNote.questions_generated_at;
  if (updatedNote.questions_status !== undefined) noteUpdateData.questions_status = updatedNote.questions_status;

  // Enriched content fields
  if (updatedNote.enriched_content !== undefined) noteUpdateData.enriched_content = updatedNote.enriched_content;
  if (updatedNote.enriched_content_generated_at !== undefined) noteUpdateData.enriched_content_generated_at = updatedNote.enriched_content_generated_at;
  if (updatedNote.enriched_status !== undefined) noteUpdateData.enriched_status = updatedNote.enriched_status;

  // YouTube-specific fields
  if (updatedNote.video_url !== undefined) noteUpdateData.video_url = updatedNote.video_url;
  if (updatedNote.video_metadata !== undefined) noteUpdateData.video_metadata = updatedNote.video_metadata;

  console.log('📝 Database update payload:', {
    id,
    updateFields: Object.keys(noteUpdateData),
    enhancementData: {
      summary: noteUpdateData.summary?.substring(0, 50) || 'none',
      key_points: noteUpdateData.key_points?.substring(0, 50) || 'none',
      questions_content: noteUpdateData.questions_content?.substring(0, 50) || 'none',
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
