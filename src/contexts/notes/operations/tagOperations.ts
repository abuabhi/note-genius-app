
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

// Function to fetch all tags from the database
export const fetchTagsFromDatabase = async () => {
  try {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchTagsFromDatabase:', error);
    return [];
  }
};

// Function to add tags to a note
export const addNoteTagsToDatabase = async (noteId: string, tags: { id?: string; name: string; color: string }[]) => {
  try {
    // First, ensure all tags exist in the tags table
    for (const tag of tags) {
      // If the tag doesn't have an ID, it's a new tag that needs to be created
      if (!tag.id) {
        const { data: existingTag, error: findError } = await supabase
          .from('tags')
          .select('id')
          .eq('name', tag.name)
          .maybeSingle();

        if (findError) {
          console.error('Error checking for existing tag:', findError);
          continue;
        }

        if (existingTag) {
          // Tag exists, use its ID
          tag.id = existingTag.id;
        } else {
          // Create new tag
          const { data: newTag, error: insertError } = await supabase
            .from('tags')
            .insert({ name: tag.name, color: tag.color })
            .select('id')
            .single();

          if (insertError) {
            console.error('Error creating tag:', insertError);
            continue;
          }

          tag.id = newTag.id;
        }
      }

      // Now add the tag to the note_tags table
      if (tag.id) {
        const { error: linkError } = await supabase
          .from('note_tags')
          .insert({ note_id: noteId, tag_id: tag.id });

        if (linkError) {
          console.error('Error linking tag to note:', linkError);
        }
      }
    }
  } catch (error) {
    console.error('Error adding note tags:', error);
    throw error;
  }
};

// Function to update tags for a note
export const updateNoteTagsInDatabase = async (noteId: string, tags: { id?: string; name: string; color: string }[]) => {
  try {
    // First, remove all existing tags for this note
    const { error: deleteError } = await supabase
      .from('note_tags')
      .delete()
      .eq('note_id', noteId);

    if (deleteError) {
      console.error('Error removing existing tags:', deleteError);
      throw deleteError;
    }

    // Then add the new tags
    await addNoteTagsToDatabase(noteId, tags);
  } catch (error) {
    console.error('Error updating note tags:', error);
    throw error;
  }
};

export const useTagOperations = () => {
  // Get all available tags
  const getAllTags = async () => {
    try {
      return await fetchTagsFromDatabase();
    } catch (error) {
      console.error('Error fetching tags:', error);
      toast.error("Failed to fetch tags");
      return [];
    }
  };

  // Filter notes by a specific tag
  const filterByTag = (tagName: string, setSearchTerm: (term: string) => void) => {
    setSearchTerm(tagName);
  };

  return {
    getAllTags,
    filterByTag
  };
};
