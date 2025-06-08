
// Utility function to strip markdown formatting and return plain text
export const stripMarkdown = (text: string): string => {
  if (!text) return '';
  
  return text
    // Remove headers (# ## ###)
    .replace(/^#+\s+/gm, '')
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove strikethrough (~~text~~)
    .replace(/~~(.*?)~~/g, '$1')
    // Remove inline code (`text`)
    .replace(/`(.*?)`/g, '$1')
    // Remove links [text](url)
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    // Remove images ![alt](url)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
    // Remove blockquotes (> text)
    .replace(/^>\s+/gm, '')
    // Remove list markers (- * +)
    .replace(/^[-*+]\s+/gm, '')
    // Remove numbered list markers (1. 2. etc)
    .replace(/^\d+\.\s+/gm, '')
    // Remove horizontal rules (--- or ***)
    .replace(/^(---|\*\*\*|___)\s*$/gm, '')
    // Remove code blocks (```text```)
    .replace(/```[\s\S]*?```/g, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Clean up multiple spaces and newlines
    .replace(/\s+/g, ' ')
    .trim();
};
