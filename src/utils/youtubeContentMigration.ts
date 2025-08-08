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
  // Try to extract a YouTube ID from the content BEFORE cleaning
  const extractYouTubeId = (text: string): string | null => {
    if (!text) return null;
    const urlMatch = text.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
    if (urlMatch?.[1]) return urlMatch[1];
    const idMatch = text.match(/(?:\*\*\s*)?(?:Video ID|YouTube ID)(?:\s*\*\*)?\s*:\s*([\w-]{11})/i);
    if (idMatch?.[1]) return idMatch[1];
    return null;
  };

  const youtubeId = extractYouTubeId(currentContent);
  const canonicalUrl = youtubeId ? `https://www.youtube.com/watch?v=${youtubeId}` : null;

  const cleanedContent = cleanYouTubeContent(currentContent);
  
  // Only update if content actually changed OR we found a canonical URL to persist
  if (cleanedContent !== currentContent || canonicalUrl) {
    const { supabase } = await import('@/integrations/supabase/client');
    
    const updatePayload: Record<string, any> = { content: cleanedContent };
    if (canonicalUrl) {
      updatePayload.video_url = canonicalUrl;
      // Also ensure the source_type is set to 'youtube' if not already
      updatePayload.source_type = 'youtube';
    }
    
    const { error } = await supabase
      .from('notes')
      .update(updatePayload)
      .eq('id', noteId);
    
    if (error) {
      console.error('Error updating note content/YouTube URL:', error);
      throw error;
    }
    
    return cleanedContent;
  }
  
  return currentContent;
};