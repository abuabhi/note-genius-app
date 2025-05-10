
// Mapping of enhancement functions to the prompts used by the API
export const enhancementPrompts: Record<string, string> = {
  'summarize': "Create a concise summary of the following note content:",
  'extract-key-points': "Extract and list the key points from the following note content:",
  'generate-questions': "Generate study questions based on the following note content:",
  'improve-clarity': "Rewrite the following note content to improve clarity and readability while preserving all information:",
  'convert-to-markdown': "Format the following note content with proper Markdown styling:",
  'fix-spelling-grammar': "Correct spelling and grammar errors in the following note content while preserving the meaning:"
};

export const createPrompt = (
  enhancementType: string,
  noteTitle: string | undefined,
  noteContent: string
): string => {
  return `${enhancementPrompts[enhancementType]}
    
Note Title: ${noteTitle || 'Untitled Note'}

Content:
${noteContent}

Response Guidelines:
- Provide a structured, concise response
- Use objective language and maintain academic tone
- Format using basic markdown for readability where appropriate
- Focus on the most important concepts from the provided content`;
};
