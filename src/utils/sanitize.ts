import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'b','i','em','strong','u','s','br','p','span','div','ul','ol','li','h1','h2','h3','h4','h5','h6',
  'blockquote','code','pre','hr','a','table','thead','tbody','tr','th','td','img','mark','del','section',
  'article','figure','figcaption','dl','dt','dd','sup','sub','small','abbr','kbd','caption','tfoot','col','colgroup'
];
const ALLOWED_ATTR = ['href','title','target','rel','class','style','src','alt','width','height','colspan','rowspan','aria-label'];
const FORBID_TAGS = ['script','iframe','object','embed','form','input','button','svg'];
const FORBID_ATTR = ['onerror','onload','srcset'];

// Centralized HTML sanitizer. KEEP_CONTENT is intentionally true so any
// unknown wrapper tag still leaves its text visible to the user — preferring
// "show the words" over "show a blank card".
export const sanitizeHTML = (html: string): string => {
  if (!html) return '';
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS,
    FORBID_ATTR,
    KEEP_CONTENT: true
  });
};

// Permissive sanitizer for AI-generated enriched note content.
// Preserves text inside unknown wrappers so users never see empty cards
// when the model emits a tag DOMPurify doesn't recognize.
export const sanitizeEnrichedHTML = (html: string): string => {
  if (!html) return '';
  // Strip any leftover internal placeholder NUL tokens before sanitizing.
  const cleaned = html.replace(/\u0000AIENH\d+\u0000/g, '');
  return DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    FORBID_TAGS,
    FORBID_ATTR,
    KEEP_CONTENT: true
  });
};
