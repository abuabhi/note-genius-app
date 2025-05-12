
import { Note } from "@/types/note";
import { addNoteToDatabase as addNoteDb, deleteNoteFromDatabase as deleteNoteDb, updateNoteInDatabase as updateNoteDb } from "./noteDbOperations";
import { updateNoteTagsInDatabase, addNoteTagsToDatabase, fetchTagsFromDatabase } from "./tagOperations";
import { updateScanDataInDatabase, addScanDataToDatabase } from "./scanOperations";
import { supabase } from "@/integrations/supabase/client";

// Re-export functions from other modules
export { fetchTagsFromDatabase } from "./tagOperations";
export { fetchNoteEnrichmentUsage } from "./usageStats";

// Main function that orchestrates adding a note with all its related data
export const addNoteToDatabase = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
  try {
    // First, insert the note
    const noteInsertData = await addNoteDb(noteData);
    
    if (!noteInsertData) {
      throw new Error("Failed to insert note");
    }

    // If it's a scanned note, insert the scan data
    if (noteData.sourceType === 'scan' && noteData.scanData) {
      await addScanDataToDatabase(noteInsertData.id, noteData.scanData);
    }

    // Add tags if provided
    if (noteData.tags && noteData.tags.length > 0) {
      await addNoteTagsToDatabase(noteInsertData.id, noteData.tags);
    }
    
    return noteInsertData;
  } catch (error) {
    console.error('Error adding note:', error);
    return null;
  }
};

export const deleteNoteFromDatabase = async (id: string): Promise<void> => {
  try {
    // Log the attempt for debugging purposes
    console.log("Operations index - Deleting note with ID:", id);
    
    // Call the edge function directly for consistent deletion process
    const { data, error: functionError } = await supabase.functions.invoke('delete-note', {
      body: { noteId: id }
    });
    
    if (functionError) {
      console.error('Operations index - Edge function call failed:', functionError);
      throw functionError;
    }
    
    console.log("Operations index - Note deleted via edge function call:", data);
  } catch (error) {
    console.error('Operations index - Error deleting note:', error);
    throw error;
  }
};

export const updateNoteInDatabase = async (id: string, updatedNote: Partial<Note>): Promise<void> => {
  try {
    // Update note basic data
    await updateNoteDb(id, updatedNote);

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
export { supabase } from "@/integrations/supabase/client";
