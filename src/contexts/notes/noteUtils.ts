// @ts-nocheck

import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";
import { Subject } from "@/types/subject";
import { Tag } from "@/types/tag";

export const fetchNotes = async (userId: string): Promise<Note[]> => {
  try {
    const { data: notes, error } = await supabase
      .from('notes')
      .select(`
        id,
        title,
        description,
        content,
        date,
        subject,
        sourceType,
        archived,
        pinned,
        subject_id,
        tags: note_tags (
          tags (
            id,
            name,
            color
          )
        )
      `)
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching notes:", error);
      return [];
    }

    // Map the data to the Note type
    const formattedNotes: Note[] = notes.map(note => ({
      id: note.id,
      title: note.title,
      description: note.description,
      content: note.content,
      date: note.date,
      subject: note.subject,
      sourceType: note.sourceType,
      archived: note.archived,
      pinned: note.pinned,
      subject_id: note.subject_id,
      tags: note.tags.map(noteTag => noteTag.tags),
    }));

    return formattedNotes;
  } catch (err) {
    console.error("Unexpected error fetching notes:", err);
    return [];
  }
};

export const fetchSubjects = async (userId: string): Promise<Subject[]> => {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching subjects:", error);
      return [];
    }

    return subjects || [];
  } catch (err) {
    console.error("Unexpected error fetching subjects:", err);
    return [];
  }
};

export const fetchTags = async (userId: string): Promise<Tag[]> => {
  try {
    const { data: tags, error } = await supabase
      .from('tags')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error("Error fetching tags:", error);
      return [];
    }

    return tags || [];
  } catch (err) {
    console.error("Unexpected error fetching tags:", err);
    return [];
  }
};

export const getOrCreateSubject = async (userId: string, subjectName: string): Promise<Subject> => {
  try {
    // Fetch existing subjects to check if the subject already exists
    const existingSubjects = await fetchSubjects(userId);
    const existingSubject = existingSubjects.find(subject => subject.name === subjectName);

    if (existingSubject) {
      return existingSubject;
    }

    // If the subject does not exist, create it
    const { data: newSubject, error } = await supabase
      .from('subjects')
      .insert([{ user_id: userId, name: subjectName }])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating subject:", error);
      throw error;
    }

    return newSubject;
  } catch (err) {
    console.error("Unexpected error getting or creating subject:", err);
    throw err;
  }
};

export const getOrCreateTag = async (userId: string, tagName: string, tagColor: string): Promise<Tag> => {
  try {
    // Fetch existing tags to check if the tag already exists
    const existingTags = await fetchTags(userId);
    const existingTag = existingTags.find(tag => tag.name === tagName);

    if (existingTag) {
      return existingTag;
    }

    // If the tag does not exist, create it
    const { data: newTag, error } = await supabase
      .from('tags')
      .insert([{ user_id: userId, name: tagName, color: tagColor }])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating tag:", error);
      throw error;
    }

    return newTag;
  } catch (err) {
    console.error("Unexpected error getting or creating tag:", err);
    throw err;
  }
};

export const getAllOrCreateTags = async (userId: string, tags: { name: string; color: string; }[]): Promise<Tag[]> => {
  try {
    const tagPromises = tags.map(tag => getOrCreateTag(userId, tag.name, tag.color));
    return await Promise.all(tagPromises);
  } catch (err) {
    console.error("Error getting or creating tags:", err);
    throw err;
  }
};

export const createNote = async (userId: string, note: Omit<Note, 'id' | 'tags'>, tags: { name: string; color: string; }[] = []): Promise<Note | null> => {
  try {
    // Get or create the subject
    const subject = await getOrCreateSubject(userId, note.subject);

    // Get all or create tags
    const allTags = await getAllOrCreateTags(userId, tags);

    // Create the note
    const { data: newNote, error } = await supabase
      .from('notes')
      .insert([{
        user_id: userId,
        title: note.title,
        description: note.description,
        content: note.content,
        date: note.date,
        subject: note.subject,
        subject_id: subject.id,
        sourceType: note.sourceType,
        archived: note.archived,
        pinned: note.pinned,
      }])
      .select('*')
      .single();

    if (error) {
      console.error("Error creating note:", error);
      return null;
    }

    // Create the note tags
    const noteTagPromises = allTags.map(tag => {
      return supabase
        .from('note_tags')
        .insert([{ note_id: newNote.id, tag_id: tag.id }]);
    });

    await Promise.all(noteTagPromises);

    return {
      id: newNote.id,
      title: newNote.title,
      description: newNote.description,
      content: newNote.content,
      date: newNote.date,
      subject: newNote.subject,
      sourceType: newNote.sourceType,
      archived: newNote.archived,
      pinned: newNote.pinned,
      subject_id: newNote.subject_id,
      tags: allTags,
    };
  } catch (err) {
    console.error("Unexpected error creating note:", err);
    return null;
  }
};

// Add missing exports for compatibility
export interface NotesQueryOptions {
  searchTerm?: string;
  selectedSubject?: string;
  showArchived?: boolean;
  sortType?: string;
  page?: number;
  limit?: number;
  subject?: string;
  pageSize?: number;
}

export const fetchNotesFromSupabase = async (options: NotesQueryOptions = {}) => {
  console.log('fetchNotesFromSupabase stubbed out');
  return {
    notes: [],
    totalCount: 0,
    hasMore: false
  };
};
