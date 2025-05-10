
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
        pinned: noteData.pinned || false
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
  // The note_tags entries will be automatically deleted due to ON DELETE CASCADE
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
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
