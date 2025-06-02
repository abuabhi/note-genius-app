
import { EnhancementFunction } from "./types";
import { callEnrichmentAPI } from "./apiService";

/**
 * Calls the edge function to enrich a note with AI
 * @param note The note to enrich
 * @param enhancementType The type of enhancement to perform
 */
export const enrichNote = async (
  note: { 
    id: string; 
    title?: string; 
    content?: string;
    category?: string;
  },
  enhancementType: EnhancementFunction
): Promise<string> => {
  return callEnrichmentAPI(note, enhancementType);
};

/**
 * Shortcut function for generating note summary
 */
export const generateNoteSummary = async (note: { 
  id: string; 
  title?: string; 
  content?: string;
  category?: string;
}): Promise<string> => {
  return enrichNote(note, 'summarize');
};

/**
 * Shortcut function for extracting key points
 */
export const extractKeyPoints = async (note: { 
  id: string; 
  title?: string; 
  content?: string;
  category?: string;
}): Promise<string> => {
  return enrichNote(note, 'extract-key-points');
};

/**
 * Shortcut function for improving clarity
 */
export const improveClarity = async (note: { 
  id: string; 
  title?: string; 
  content?: string;
  category?: string;
}): Promise<string> => {
  return enrichNote(note, 'improve-clarity');
};

/**
 * Shortcut function for converting to markdown
 */
export const convertToMarkdown = async (note: { 
  id: string; 
  title?: string; 
  content?: string;
  category?: string;
}): Promise<string> => {
  return enrichNote(note, 'convert-to-markdown');
};
