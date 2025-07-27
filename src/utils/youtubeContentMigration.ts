/**
 * Utility to clean up YouTube note content by removing redundant metadata
 */
export const cleanYouTubeContent = (content: string): string => {
  if (!content) return content;

  // Split content into lines
  const lines = content.split('\n');
  const cleanedLines: string[] = [];
  let skipNextLine = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip if we're in a skip state
    if (skipNextLine) {
      skipNextLine = false;
      continue;
    }
    
    // Skip YouTube video title (starts with # YouTube Video)
    if (line.match(/^#\s*YouTube\s*Video\s*/i)) {
      continue;
    }
    
    // Skip metadata lines
    if (line.match(/^(YouTube URL|Video ID|Extracted|Source):/i)) {
      continue;
    }
    
    // Skip empty lines that follow metadata
    if (line === '' && cleanedLines.length === 0) {
      continue;
    }
    
    // Skip horizontal rules (---)
    if (line.match(/^-{3,}$/)) {
      continue;
    }
    
    // Add the line if it's not metadata
    cleanedLines.push(lines[i]);
  }
  
  // Remove leading empty lines
  while (cleanedLines.length > 0 && cleanedLines[0].trim() === '') {
    cleanedLines.shift();
  }
  
  return cleanedLines.join('\n');
};

/**
 * Database migration utility for cleaning YouTube note content
 */
export const migrateYouTubeNoteContent = async (noteId: string, currentContent: string) => {
  const cleanedContent = cleanYouTubeContent(currentContent);
  
  // Only update if content actually changed
  if (cleanedContent !== currentContent) {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const { error } = await supabase
      .from('notes')
      .update({ content: cleanedContent })
      .eq('id', noteId);
    
    if (error) {
      console.error('Error updating note content:', error);
      throw error;
    }
    
    return cleanedContent;
  }
  
  return currentContent;
};