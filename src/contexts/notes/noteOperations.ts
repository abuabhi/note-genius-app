
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
        source_type: noteData.sourceType
      })
      .select()
      .single();

    if (noteError) {
      throw noteError;
    }

    // If it's a scanned note, insert the scan data
    if (noteData.sourceType === 'scan' && noteData.scanData) {
      const { error: scanError } = await supabase
        .from('scan_data')
        .insert({
          note_id: noteInsertData.id,
          original_image_url: noteData.scanData.originalImageUrl,
          recognized_text: noteData.scanData.recognizedText,
          confidence: noteData.scanData.confidence
        });

      if (scanError) {
        throw scanError;
      }
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
      scanData: noteData.sourceType === 'scan' && noteData.scanData ? {
        originalImageUrl: noteData.scanData.originalImageUrl,
        recognizedText: noteData.scanData.recognizedText,
        confidence: noteData.scanData.confidence
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

  if (Object.keys(noteUpdateData).length > 0) {
    const { error: noteError } = await supabase
      .from('notes')
      .update(noteUpdateData)
      .eq('id', id);

    if (noteError) {
      throw noteError;
    }
  }

  // Update scan data if provided
  if (updatedNote.scanData) {
    const { error: scanError } = await supabase
      .from('scan_data')
      .update({
        original_image_url: updatedNote.scanData.originalImageUrl,
        recognized_text: updatedNote.scanData.recognizedText,
        confidence: updatedNote.scanData.confidence
      })
      .eq('note_id', id);

    if (scanError) {
      throw scanError;
    }
  }
};
