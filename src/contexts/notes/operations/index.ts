
import { Note } from "@/types/note";
import { addNoteToDatabase, deleteNoteFromDatabase, updateNoteInDatabase } from "./noteDbOperations";
import { updateNoteTagsInDatabase, addNoteTagsToDatabase } from "./tagOperations";
import { updateScanDataInDatabase, addScanDataToDatabase } from "./scanOperations";

export { fetchTagsFromDatabase } from "./tagOperations";
export { fetchNoteEnrichmentUsage } from "./usageStats";

// Main function that orchestrates adding a note with all its related data
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

    // If it's a scanned note, insert the scan data
    if (noteData.sourceType === 'scan' && noteData.scanData) {
      await addScanDataToDatabase(noteInsertData.id, noteData.scanData);
    }

    // Add tags if provided
    if (noteData.tags && noteData.tags.length > 0) {
      await addNoteTagsToDatabase(noteInsertData.id, noteData.tags);
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
  await deleteNoteFromDatabase(id);
};

export const updateNoteInDatabase = async (id: string, updatedNote: Partial<Note>): Promise<void> => {
  try {
    // Update note basic data
    await updateNoteInDatabase(id, updatedNote);

    // Update scan data if provided
    if (updatedNote.scanData) {
      await updateScanDataInDatabase(id, updatedNote.scanData);
    }

    // Update tags if provided
    if (updatedNote.tags) {
      await updateNoteTagsInDatabase(id, updatedNote.tags);
    }
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

// Re-export the supabase instance for convenience
import { supabase } from "@/integrations/supabase/client";
export { supabase };
