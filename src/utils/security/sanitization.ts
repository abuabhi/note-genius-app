import DOMPurify from 'dompurify';

// Configure DOMPurify with secure settings
const configureDOMPurify = () => {
  DOMPurify.setConfig({
    // Allow only safe HTML tags
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre'
    ],
    // Allow only safe attributes
    ALLOWED_ATTR: ['class'],
    // Forbid tags and attributes
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'style', 'src', 'href'],
    // Clean up whitespace
    KEEP_CONTENT: true,
    // Return DOM instead of string for better performance
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    // Add hooks for additional security
    ADD_TAGS: [],
    ADD_ATTR: []
  });
};

// Initialize DOMPurify configuration
configureDOMPurify();

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHTML = (html: string): string => {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(html, {
    // Additional runtime options
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false
  });
};

/**
 * Sanitizes flashcard content specifically
 * @param content - The flashcard content to sanitize
 * @returns Sanitized content
 */
export const sanitizeFlashcardContent = (content: string): string => {
  if (!content || typeof content !== 'string') {
    return '';
  }
  
  // More restrictive for flashcards
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'code'],
    ALLOWED_ATTR: [],
    FORBID_TAGS: ['script', 'object', 'embed', 'iframe', 'form', 'input', 'img'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'style', 'src', 'href', 'data-*'],
    KEEP_CONTENT: true
  });
};

/**
 * Sanitizes user input text (removes all HTML)
 * @param text - The text to sanitize
 * @returns Plain text with HTML stripped
 */
export const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }
  
  // Strip all HTML and return plain text
  return DOMPurify.sanitize(text, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  });
};

/**
 * Validates that content doesn't contain dangerous patterns
 * @param content - The content to validate
 * @returns Object with validation result and errors
 */
export const validateContentSecurity = (content: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (!content || typeof content !== 'string') {
    return { isValid: true, errors: [] };
  }
  
  // Check for dangerous patterns
  const dangerousPatterns = [
    /javascript:/gi,
    /data:text\/html/gi,
    /vbscript:/gi,
    /on\w+\s*=/gi,
    /<script/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<form/gi,
    /document\./gi,
    /window\./gi,
    /eval\(/gi,
    /function\(/gi,
    /constructor/gi,
    /__proto__/gi
  ];
  
  for (const pattern of dangerousPatterns) {
    if (pattern.test(content)) {
      errors.push(`Dangerous pattern detected: ${pattern.source}`);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};