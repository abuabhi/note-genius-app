// @ts-nocheck

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/types/note';
import { useEffect, useState } from 'react';

interface Tag {
  id?: string;
  name: string;
  color: string;
}

interface FilterOptions {
  searchTerm: string;
  selectedSubjects: string[];
  selectedTags: Tag[];
  archived: boolean | null;
  pinned: boolean | null;
  sortOption: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export const useOptimizedNotesFilter = (filterOptions: FilterOptions) => {
  const { user } = useAuth();
  const { searchTerm, selectedSubjects, selectedTags, archived, pinned, sortOption } = filterOptions;
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndFilterNotes = async () => {
      if (!user) {
        console.log("No user logged in")
        return;
      }

      setLoading(true);
      setError(null);

      try {
        let query = supabase
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
            tags (
              id,
              name,
              color
            )
          `)
          .eq('user_id', user.id);

        if (searchTerm) {
          query = query.ilike('title', `%${searchTerm}%`);
        }

        if (selectedSubjects.length > 0) {
          query = query.in('subject_id', selectedSubjects);
        }

        if (archived !== null) {
          query = query.eq('archived', archived);
        }

        if (pinned !== null) {
          query = query.eq('pinned', pinned);
        }

        if (sortOption.field) {
          query = query.order(sortOption.field, { ascending: sortOption.direction === 'asc' });
        }

        const { data, error } = await query;

        if (error) {
          console.error("Error fetching notes:", error);
          setError(error.message);
          setLoading(false);
          return;
        }

        if (data) {
          const formattedNotes = data.map(note => ({
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
            tags: note.tags.map(tag => ({ id: tag.id, name: tag.name, color: tag.color }))
          }));

          let filteredNotes = formattedNotes;

          if (selectedTags.length > 0) {
            filteredNotes = filteredNotes.filter(note => {
              if (!note.tags || note.tags.length === 0) {
                return false;
              }
              return selectedTags.every(selectedTag =>
                note.tags.some(noteTag => noteTag.id === selectedTag.id)
              );
            });
          }

          setNotes(filteredNotes);
        } else {
          setNotes([]);
        }

      } catch (err: any) {
        console.error("Unexpected error fetching notes:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAndFilterNotes();
  }, [user, searchTerm, selectedSubjects, selectedTags, archived, pinned, sortOption]);

  return {
    notes,
    loading,
    error,
  };
};
