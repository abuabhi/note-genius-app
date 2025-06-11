
import { useCallback } from 'react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { useSecurityValidation } from './useSecurityValidation';
import { useInputValidation } from './useInputValidation';
import { useProductionMetrics } from './useProductionMetrics';
import { Note } from '@/types/note';
import { toast } from 'sonner';

export const useOptimizedNotesWithSecurity = () => {
  const originalHook = useOptimizedNotes();
  const { validateSecurityContext, sanitizeInput } = useSecurityValidation();
  const { validateNote, validateSearch, validatePagination } = useInputValidation();
  const { recordMetric } = useProductionMetrics('SecureNotesOperations');

  // Secure note addition
  const addNoteSecure = useCallback(async (noteData: Omit<Note, 'id'>): Promise<Note | null> => {
    const startTime = performance.now();
    
    try {
      // Security validation
      const securityCheck = validateSecurityContext({
        data: noteData,
        origin: window.location.origin
      });

      if (!securityCheck.isSecure) {
        recordMetric('security_violation', 1, { violations: securityCheck.violations });
        toast.error('Security check failed');
        return null;
      }

      // Input validation
      const validation = validateNote(noteData);
      if (!validation.isValid) {
        recordMetric('validation_error', 1, { errors: validation.errors });
        toast.error(`Validation failed: ${validation.errors[0]}`);
        return null;
      }

      // Sanitize inputs
      const sanitizedData = {
        ...validation.data,
        title: sanitizeInput(validation.data.title),
        description: sanitizeInput(validation.data.description),
        content: validation.data.content ? sanitizeInput(validation.data.content) : ''
      };

      const result = await originalHook.addNote(sanitizedData);
      
      const duration = performance.now() - startTime;
      recordMetric('secure_note_add_success', duration);
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      recordMetric('secure_note_add_error', duration, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }, [originalHook.addNote, validateSecurityContext, validateNote, sanitizeInput, recordMetric]);

  // Secure note update
  const updateNoteSecure = useCallback(async (id: string, updates: Partial<Note>): Promise<void> => {
    const startTime = performance.now();
    
    try {
      // Security validation
      const securityCheck = validateSecurityContext({
        data: { id, updates },
        origin: window.location.origin
      });

      if (!securityCheck.isSecure) {
        recordMetric('security_violation', 1, { violations: securityCheck.violations });
        toast.error('Security check failed');
        return;
      }

      // Validate partial note data
      if (updates.title || updates.description || updates.content || updates.tags) {
        const validation = validateNote({
          title: updates.title || 'temp',
          description: updates.description || '',
          content: updates.content || '',
          subject: updates.subject || 'temp',
          tags: updates.tags || [],
          sourceType: updates.sourceType || 'manual'
        });

        if (!validation.isValid) {
          recordMetric('validation_error', 1, { errors: validation.errors });
          toast.error(`Validation failed: ${validation.errors[0]}`);
          return;
        }
      }

      // Sanitize string inputs
      const sanitizedUpdates = { ...updates };
      if (updates.title) sanitizedUpdates.title = sanitizeInput(updates.title);
      if (updates.description) sanitizedUpdates.description = sanitizeInput(updates.description);
      if (updates.content) sanitizedUpdates.content = sanitizeInput(updates.content);

      await originalHook.updateNote(id, sanitizedUpdates);
      
      const duration = performance.now() - startTime;
      recordMetric('secure_note_update_success', duration);
    } catch (error) {
      const duration = performance.now() - startTime;
      recordMetric('secure_note_update_error', duration, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      throw error;
    }
  }, [originalHook.updateNote, validateSecurityContext, validateNote, sanitizeInput, recordMetric]);

  // Secure search with validation
  const setSearchTermSecure = useCallback((term: string) => {
    try {
      const validation = validateSearch({ query: term });
      if (!validation.isValid) {
        recordMetric('search_validation_error', 1, { errors: validation.errors });
        toast.error('Invalid search query');
        return;
      }

      const sanitizedTerm = sanitizeInput(term);
      originalHook.setSearchTerm(sanitizedTerm);
      recordMetric('secure_search_success', 1);
    } catch (error) {
      recordMetric('secure_search_error', 1, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [originalHook.setSearchTerm, validateSearch, sanitizeInput, recordMetric]);

  // Secure pagination
  const setCurrentPageSecure = useCallback((page: number) => {
    try {
      const validation = validatePagination({
        page,
        pageSize: 20,
        sortBy: 'newest' as const
      });

      if (!validation.isValid) {
        recordMetric('pagination_validation_error', 1, { errors: validation.errors });
        return;
      }

      originalHook.setCurrentPage(page);
      recordMetric('secure_pagination_success', 1);
    } catch (error) {
      recordMetric('secure_pagination_error', 1, { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  }, [originalHook.setCurrentPage, validatePagination, recordMetric]);

  return {
    // Secure versions of operations
    addNote: addNoteSecure,
    updateNote: updateNoteSecure,
    setSearchTerm: setSearchTermSecure,
    setCurrentPage: setCurrentPageSecure,
    
    // Pass through other properties as-is
    notes: originalHook.notes,
    totalCount: originalHook.totalCount,
    hasMore: originalHook.hasMore,
    isLoading: originalHook.isLoading,
    error: originalHook.error,
    searchTerm: originalHook.searchTerm,
    sortType: originalHook.sortType,
    setSortType: originalHook.setSortType,
    showArchived: originalHook.showArchived,
    setShowArchived: originalHook.setShowArchived,
    selectedSubject: originalHook.selectedSubject,
    setSelectedSubject: originalHook.setSelectedSubject,
    currentPage: originalHook.currentPage,
    refetch: originalHook.refetch,
    prefetchNextPage: originalHook.prefetchNextPage,
    deleteNote: originalHook.deleteNote
  };
};
