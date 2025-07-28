/**
 * Utility to clean up YouTube note content by removing redundant metadata
 */
export const cleanYouTubeContent = (content: string): string => {
  if (!content) return content;

  // Split content into lines
  const lines = content.split('\n');
  const cleanedLines: string[] = [];
  let inMetadataSection = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Skip YouTube video title (starts with # YouTube Video)
    if (line.match(/^#\s*YouTube\s*Video\s*/i)) {
      inMetadataSection = true;
      continue;
    }
    
    // Skip transcript header (## 📝 Full Transcript)
    if (line.match(/^##\s*📝\s*Full\s*Transcript/i)) {
      inMetadataSection = false; // This marks end of metadata, start of content
      continue;
    }
    
    // Skip all metadata lines - both plain and bold markdown format
    if (line.match(/^(\*\*)?(YouTube URL|Video ID|Extracted|Source|Channel|Duration|Views|Title)(\*\*)?:/i)) {
      inMetadataSection = true;
      continue;
    }
    
    // Skip horizontal rules (---)
    if (line.match(/^-{3,}$/)) {
      inMetadataSection = true;
      continue;
    }
    
    // Skip empty lines in metadata section
    if (inMetadataSection && line === '') {
      continue;
    }
    
    // If we encounter actual content, stop being in metadata section
    if (line !== '' && 
        !line.match(/^(\*\*)?(YouTube URL|Video ID|Extracted|Source|Channel|Duration|Views|Title)(\*\*)?:/i) && 
        !line.match(/^#\s*YouTube\s*Video\s*/i) && 
        !line.match(/^##\s*📝\s*Full\s*Transcript/i) &&
        !line.match(/^-{3,}$/)) {
      inMetadataSection = false;
    }
    
    // Add the line if it's not metadata
    if (!inMetadataSection) {
      cleanedLines.push(lines[i]);
    }
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