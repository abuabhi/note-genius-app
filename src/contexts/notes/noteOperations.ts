
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

    // If it's a scanned note, insert the scan data
    if (noteData.sourceType === 'scan' && noteData.scanData) {
      const { error: scanError } = await supabase
        .from('scan_data')
        .insert({
          note_id: noteInsertData.id,
          original_image_url: noteData.scanData.originalImageUrl,
          recognized_text: noteData.scanData.recognizedText,
          confidence: noteData.scanData.confidence,
          language: noteData.scanData.language // Include language
        });

      if (scanError) {
        throw scanError;
      }
    }

    // Add tags if provided
    if (noteData.tags && noteData.tags.length > 0) {
      // First ensure all tags exist in the database
      for (const tag of noteData.tags) {
        // Try to insert the tag (it will fail silently if the tag already exists due to UNIQUE constraint)
        await supabase.from('tags').insert({ name: tag.name, color: tag.color }).select();
      }

      // Get all the tags we need
      const { data: tagsData, error: tagsError } = await supabase
        .from('tags')
        .select('id, name, color')
        .in('name', noteData.tags.map(tag => tag.name));

      if (tagsError) {
        throw tagsError;
      }

      // Link tags to the note
      if (tagsData && tagsData.length > 0) {
        const noteTagInserts = tagsData.map(tag => ({
          note_id: noteInsertData.id,
          tag_id: tag.id
        }));

        const { error: noteTagsError } = await supabase
          .from('note_tags')
          .insert(noteTagInserts);

        if (noteTagsError) {
          throw noteTagsError;
        }
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

  // Update scan data if provided
  if (updatedNote.scanData) {
    const { error: scanError } = await supabase
      .from('scan_data')
      .update({
        original_image_url: updatedNote.scanData.originalImageUrl,
        recognized_text: updatedNote.scanData.recognizedText,
        confidence: updatedNote.scanData.confidence,
        language: updatedNote.scanData.language
      })
      .eq('note_id', id);

    if (scanError) {
      throw scanError;
    }
  }

  // Update tags if provided
  if (updatedNote.tags) {
    // First, get current tags for the note
    const { data: currentNoteTags, error: currentNoteTagsError } = await supabase
      .from('note_tags')
      .select('tag_id')
      .eq('note_id', id);

    if (currentNoteTagsError) {
      throw currentNoteTagsError;
    }

    // Ensure all new tags exist in the database
    for (const tag of updatedNote.tags) {
      // Try to insert the tag (will fail silently if tag already exists)
      await supabase.from('tags').insert({ name: tag.name, color: tag.color }).select();
    }

    // Get IDs for all the new tags
    const { data: tagsData, error: tagsError } = await supabase
      .from('tags')
      .select('id, name, color')
      .in('name', updatedNote.tags.map(tag => tag.name));

    if (tagsError) {
      throw tagsError;
    }

    // Find tags to add and tags to remove
    const currentTagIds = currentNoteTags?.map(nt => nt.tag_id) || [];
    const newTagIds = tagsData?.map(t => t.id) || [];
    
    // Tags to add (in newTagIds but not in currentTagIds)
    const tagsToAdd = newTagIds.filter(id => !currentTagIds.includes(id));
    
    // Tags to remove (in currentTagIds but not in newTagIds)
    const tagsToRemove = currentTagIds.filter(id => !newTagIds.includes(id));

    // Add new tags
    if (tagsToAdd.length > 0) {
      const noteTagInserts = tagsToAdd.map(tagId => ({
        note_id: id,
        tag_id: tagId
      }));

      const { error: addTagsError } = await supabase
        .from('note_tags')
        .insert(noteTagInserts);

      if (addTagsError) {
        throw addTagsError;
      }
    }

    // Remove tags that are no longer associated
    if (tagsToRemove.length > 0) {
      const { error: removeTagsError } = await supabase
        .from('note_tags')
        .delete()
        .eq('note_id', id)
        .in('tag_id', tagsToRemove);

      if (removeTagsError) {
        throw removeTagsError;
      }
    }
  }
};

export const fetchTagsFromDatabase = async (): Promise<{ id: string; name: string; color: string }[]> => {
  const { data, error } = await supabase
    .from('tags')
    .select('id, name, color')
    .order('name');

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data;
};

// Get the current usage statistics for note enrichments
export const fetchNoteEnrichmentUsage = async (): Promise<{ current: number, limit: number | null }> => {
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // Format: YYYY-MM
    
    // Get user tier first
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('user_tier')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();
      
    if (profileError) throw profileError;
    
    // Get tier limits
    const { data: tierLimits, error: tierError } = await supabase
      .from('tier_limits')
      .select('note_enrichment_limit_per_month')
      .eq('tier', profileData.user_tier)
      .single();
      
    if (tierError) throw tierError;
    
    // Get current usage
    const { data: usageData, error: usageError } = await supabase
      .from('note_enrichment_usage')
      .select('id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
      .eq('month_year', currentMonth);
      
    if (usageError) throw usageError;
    
    return {
      current: usageData.length,
      limit: tierLimits.note_enrichment_limit_per_month
    };
  } catch (error) {
    console.error('Error fetching note enrichment usage:', error);
    return { current: 0, limit: null };
  }
};
