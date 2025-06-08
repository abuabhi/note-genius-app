
import { useCallback } from 'react';
import { z } from 'zod';

// Validation schemas
const noteSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(500, 'Description too long'),
  content: z.string().max(50000, 'Content too long'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.object({
    name: z.string().min(1).max(50),
    color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format')
  })).max(10, 'Too many tags'),
  sourceType: z.enum(['manual', 'scan', 'import'])
});

const searchSchema = z.object({
  query: z.string().max(100, 'Search query too long'),
  filters: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).max(5).optional(),
    dateRange: z.object({
      start: z.string().optional(),
      end: z.string().optional()
    }).optional()
  }).optional()
});

const paginationSchema = z.object({
  page: z.number().min(1).max(1000),
  pageSize: z.number().min(1).max(100),
  sortBy: z.enum(['newest', 'oldest', 'alphabetical']),
  sortOrder: z.enum(['asc', 'desc']).optional()
});

export const useInputValidation = () => {
  // Validate note data
  const validateNote = useCallback((data: any) => {
    try {
      const validated = noteSchema.parse(data);
      return { isValid: true, data: validated, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          data: null,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return {
        isValid: false,
        data: null,
        errors: ['Validation error occurred']
      };
    }
  }, []);

  // Validate search parameters
  const validateSearch = useCallback((data: any) => {
    try {
      const validated = searchSchema.parse(data);
      return { isValid: true, data: validated, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          data: null,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return {
        isValid: false,
        data: null,
        errors: ['Search validation error']
      };
    }
  }, []);

  // Validate pagination parameters
  const validatePagination = useCallback((data: any) => {
    try {
      const validated = paginationSchema.parse(data);
      return { isValid: true, data: validated, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          data: null,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return {
        isValid: false,
        data: null,
        errors: ['Pagination validation error']
      };
    }
  }, []);

  // General-purpose validator
  const validateWithSchema = useCallback((schema: z.ZodSchema, data: any) => {
    try {
      const validated = schema.parse(data);
      return { isValid: true, data: validated, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          data: null,
          errors: error.errors.map(e => `${e.path.join('.')}: ${e.message}`)
        };
      }
      return {
        isValid: false,
        data: null,
        errors: ['Validation error']
      };
    }
  }, []);

  return {
    validateNote,
    validateSearch,
    validatePagination,
    validateWithSchema,
    schemas: {
      note: noteSchema,
      search: searchSchema,
      pagination: paginationSchema
    }
  };
};
