import DOMPurify from 'dompurify';

// Centralized HTML sanitizer
// Only allow a safe subset of tags/attributes used by our renderers
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b','i','em','strong','u','s','br','p','span','ul','ol','li','h1','h2','h3','h4','h5','h6','blockquote','code','pre','hr','a'
    ],
    ALLOWED_ATTR: ['href','title','target','rel','class'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script','style','iframe','object','embed','form','input','button','img','svg'],
    FORBID_ATTR: ['onerror','onload','style','src','srcset'],
    KEEP_CONTENT: false
  });
};
