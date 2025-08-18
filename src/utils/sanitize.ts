import DOMPurify from 'dompurify';

// Centralized HTML sanitizer
// Only allow a safe subset of tags/attributes used by our renderers
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'b','i','em','strong','u','s','br','p','span','div','ul','ol','li','h1','h2','h3','h4','h5','h6',
      'blockquote','code','pre','hr','a','table','thead','tbody','tr','th','td','img','mark','del'
    ],
    ALLOWED_ATTR: ['href','title','target','rel','class','style','src','alt','width','height','colspan','rowspan'],
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS: ['script','iframe','object','embed','form','input','button','svg'],
    FORBID_ATTR: ['onerror','onload','srcset'],
    KEEP_CONTENT: false
  });
};
