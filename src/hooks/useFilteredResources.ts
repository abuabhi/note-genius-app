import { useMemo } from 'react';
import { Resource } from '@/types/resource';

export interface ResourceFilters {
  search: string;
  subject: string;
  resourceType: string;
  difficultyLevel: string;
  isFavorite: boolean;
  sort: string;
}

/**
 * Client-side filtering and sorting for resources
 */
export function useFilteredResources(
  resources: Resource[],
  filters: ResourceFilters
) {
  return useMemo(() => {
    let filtered = resources;

    // Search filter
    if (filters.search.trim()) {
      const searchTerm = filters.search.toLowerCase().trim();
      filtered = filtered.filter(resource => 
        resource.title.toLowerCase().includes(searchTerm) ||
        resource.description?.toLowerCase().includes(searchTerm) ||
        resource.author?.toLowerCase().includes(searchTerm) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    // Subject filter
    if (filters.subject && filters.subject !== 'all') {
      filtered = filtered.filter(resource => {
        // Check if resource has a subject_id that matches
        // This would need to be enhanced with actual subject lookup
        return true; // For now, keep all resources
      });
    }

    // Resource type filter
    if (filters.resourceType && filters.resourceType !== 'all') {
      filtered = filtered.filter(resource => 
        resource.resource_type === filters.resourceType
      );
    }

    // Difficulty level filter
    if (filters.difficultyLevel && filters.difficultyLevel !== 'all') {
      filtered = filtered.filter(resource => 
        resource.difficulty_level === filters.difficultyLevel
      );
    }

    // Favorites filter
    if (filters.isFavorite) {
      filtered = filtered.filter(resource => resource.is_favorite);
    }

    // Sorting
    const sorted = [...filtered].sort((a, b) => {
      switch (filters.sort) {
        case 'newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'alphabetical':
          return a.title.localeCompare(b.title);
        case 'most_accessed':
          return (b.access_count || 0) - (a.access_count || 0);
        default:
          return 0;
      }
    });

    return sorted;
  }, [resources, filters]);
}