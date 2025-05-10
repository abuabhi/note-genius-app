
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

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

export const updateNoteTagsInDatabase = async (
  noteId: string, 
  tags?: { id?: string; name: string; color: string }[]
): Promise<void> => {
  if (!tags) return;

  // First, ensure all tags exist in the database
  for (const tag of tags) {
    // Try to insert the tag (will fail silently if tag already exists)
    await supabase.from('tags').insert({ name: tag.name, color: tag.color }).select();
  }

  // Get IDs for all the new tags
  const { data: tagsData, error: tagsError } = await supabase
    .from('tags')
    .select('id, name, color')
    .in('name', tags.map(tag => tag.name));

  if (tagsError) {
    throw tagsError;
  }

  // First, get current tags for the note
  const { data: currentNoteTags, error: currentNoteTagsError } = await supabase
    .from('note_tags')
    .select('tag_id')
    .eq('note_id', noteId);

  if (currentNoteTagsError) {
    throw currentNoteTagsError;
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
      note_id: noteId,
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
      .eq('note_id', noteId)
      .in('tag_id', tagsToRemove);

    if (removeTagsError) {
      throw removeTagsError;
    }
  }
};

export const addNoteTagsToDatabase = async (
  noteId: string, 
  tags?: { id?: string; name: string; color: string }[]
): Promise<void> => {
  if (!tags || tags.length === 0) return;
  
  // First ensure all tags exist in the database
  for (const tag of tags) {
    // Try to insert the tag (it will fail silently if the tag already exists due to UNIQUE constraint)
    await supabase.from('tags').insert({ name: tag.name, color: tag.color }).select();
  }

  // Get all the tags we need
  const { data: tagsData, error: tagsError } = await supabase
    .from('tags')
    .select('id, name, color')
    .in('name', tags.map(tag => tag.name));

  if (tagsError) {
    throw tagsError;
  }

  // Link tags to the note
  if (tagsData && tagsData.length > 0) {
    const noteTagInserts = tagsData.map(tag => ({
      note_id: noteId,
      tag_id: tag.id
    }));

    const { error: noteTagsError } = await supabase
      .from('note_tags')
      .insert(noteTagInserts);

    if (noteTagsError) {
      throw noteTagsError;
    }
  }
};
