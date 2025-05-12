
import { Note } from "@/types/note";
import { addNoteToDatabase as addNoteDb, deleteNoteFromDatabase as deleteNoteDb, updateNoteInDatabase as updateNoteDb } from "./noteDbOperations";
import { updateNoteTagsInDatabase, addNoteTagsToDatabase, fetchTagsFromDatabase } from "./tagOperations";
import { updateScanDataInDatabase, addScanDataToDatabase } from "./scanOperations";

// Re-export functions from other modules
export { fetchTagsFromDatabase } from "./tagOperations";
export { fetchNoteEnrichmentUsage } from "./usageStats";

// Main function that orchestrates adding a note with all its related data
export const addNoteToDatabase = async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
  try {
    console.log("Adding note to database with data:", noteData);
    
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
    
    console.log("Successfully added note with ID:", noteInsertData.id);
    return noteInsertData;
  } catch (error) {
    console.error('Error adding note:', error);
    return null;
  }
};

export const deleteNoteFromDatabase = async (id: string): Promise<void> => {
  console.log("Starting note deletion process for ID:", id);
  try {
    await deleteNoteDb(id);
    console.log("Note deletion completed successfully for ID:", id);
  } catch (error) {
    console.error("Error in deleteNoteFromDatabase:", error);
    throw error; // Re-throw to allow handling in UI
  }
};

export const updateNoteInDatabase = async (id: string, updatedNote: Partial<Note>): Promise<void> => {
  try {
    console.log("Updating note with ID:", id);
    
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
    
    console.log("Note update completed successfully");
  } catch (error) {
    console.error('Error updating note:', error);
    throw error;
  }
};

// Re-export the supabase instance for convenience
export { supabase } from "@/integrations/supabase/client";
