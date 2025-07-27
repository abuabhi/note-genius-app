import { useCallback } from 'react';
import { sanitizeFlashcardContent, validateContentSecurity } from '@/utils/security/sanitization';

/**
 * Hook for secure flashcard content handling
 */
export const useSecureFlashcards = () => {
  // Sanitize flashcard content before saving
  const sanitizeContent = useCallback((content: string) => {
    const sanitized = sanitizeFlashcardContent(content);
    const validation = validateContentSecurity(sanitized);
    
    if (!validation.isValid) {
      console.warn('Flashcard content security validation failed:', validation.errors);
      // Return sanitized content even if validation fails, but log the issues
    }
    
    return sanitized;
  }, []);

  // Prepare flashcard for display (additional safety layer)
  const prepareForDisplay = useCallback((content: string) => {
    // Always sanitize before display as an additional safety measure
    return sanitizeFlashcardContent(content);
  }, []);

  // Validate flashcard content before processing
  const validateFlashcard = useCallback((front: string, back: string) => {
    const errors: string[] = [];
    
    // Validate front content
    const frontValidation = validateContentSecurity(front);
    if (!frontValidation.isValid) {
      errors.push(...frontValidation.errors.map(e => `Front: ${e}`));
    }
    
    // Validate back content  
    const backValidation = validateContentSecurity(back);
    if (!backValidation.isValid) {
      errors.push(...backValidation.errors.map(e => `Back: ${e}`));
    }
    
    // Check content length
    if (front.length > 5000) {
      errors.push('Front content exceeds maximum length (5000 characters)');
    }
    
    if (back.length > 5000) {
      errors.push('Back content exceeds maximum length (5000 characters)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);

  return {
    sanitizeContent,
    prepareForDisplay,
    validateFlashcard
  };
};