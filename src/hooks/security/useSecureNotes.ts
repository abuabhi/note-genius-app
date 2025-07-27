import { useCallback } from 'react';
import { sanitizeHTML, sanitizeText, validateContentSecurity } from '@/utils/security/sanitization';

/**
 * Hook for secure note content handling
 */
export const useSecureNotes = () => {
  // Sanitize note content before saving
  const sanitizeNoteContent = useCallback((content: string, allowHTML: boolean = true) => {
    if (allowHTML) {
      return sanitizeHTML(content);
    } else {
      return sanitizeText(content);
    }
  }, []);

  // Sanitize note title and description (no HTML allowed)
  const sanitizeNoteText = useCallback((text: string) => {
    return sanitizeText(text);
  }, []);

  // Validate note content comprehensively
  const validateNote = useCallback((title: string, description: string, content: string) => {
    const errors: string[] = [];
    
    // Validate title
    if (!title || title.trim().length === 0) {
      errors.push('Title is required');
    } else if (title.length > 200) {
      errors.push('Title exceeds maximum length (200 characters)');
    }
    
    const titleValidation = validateContentSecurity(title);
    if (!titleValidation.isValid) {
      errors.push(...titleValidation.errors.map(e => `Title: ${e}`));
    }
    
    // Validate description
    if (description && description.length > 500) {
      errors.push('Description exceeds maximum length (500 characters)');
    }
    
    if (description) {
      const descValidation = validateContentSecurity(description);
      if (!descValidation.isValid) {
        errors.push(...descValidation.errors.map(e => `Description: ${e}`));
      }
    }
    
    // Validate content
    if (content && content.length > 50000) {
      errors.push('Content exceeds maximum length (50,000 characters)');
    }
    
    if (content) {
      const contentValidation = validateContentSecurity(content);
      if (!contentValidation.isValid) {
        errors.push(...contentValidation.errors.map(e => `Content: ${e}`));
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  // Prepare content for safe rendering
  const prepareForDisplay = useCallback((content: string, allowHTML: boolean = true) => {
    if (allowHTML) {
      return sanitizeHTML(content);
    } else {
      return sanitizeText(content);
    }
  }, []);

  return {
    sanitizeNoteContent,
    sanitizeNoteText,
    validateNote,
    prepareForDisplay
  };
};