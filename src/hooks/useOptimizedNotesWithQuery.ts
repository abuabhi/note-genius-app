// @ts-nocheck

import { useState, useMemo, useCallback } from 'react';
import { useNotesQuery, useNotesInfiniteQuery } from './queries/useNotesQueries';
import { NotesQueryOptions } from '@/contexts/notes/noteUtils';

interface FilterOptions {
  searchTerm: string;
  selectedSubjects: string[];
  selectedTags: string[];
  archived: boolean | null;
  pinned: boolean | null;
  sortOption: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

export const useOptimizedNotesWithQuery = (filterOptions: FilterOptions, queryOptions: NotesQueryOptions = {}) => {
  const { searchTerm, selectedSubjects, selectedTags, archived, pinned, sortOption } = filterOptions;

  const updatedQueryOptions = useMemo(() => {
    let newOptions: NotesQueryOptions = { ...queryOptions };

    if (searchTerm) {
      newOptions.searchTerm = searchTerm;
    }

    if (selectedSubjects.length > 0) {
      newOptions.subjectIds = selectedSubjects;
    }

    if (selectedTags.length > 0) {
      newOptions.tagIds = selectedTags;
    }

    if (archived !== null) {
      newOptions.archived = archived;
    }

    if (pinned !== null) {
      newOptions.pinned = pinned;
    }

    if (sortOption.field) {
      newOptions.sortBy = sortOption.field;
      newOptions.sortOrder = sortOption.direction;
    }

    return newOptions;
  }, [searchTerm, selectedSubjects, selectedTags, archived, pinned, sortOption, queryOptions]);

  const { data, isLoading, error, refetch } = useNotesQuery(updatedQueryOptions);

  return {
    notes: data?.notes || [],
    isLoading,
    error,
    refetch,
  };
};
