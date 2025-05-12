
import { toast } from "sonner";
import { Note } from "@/types/note";
import { updateNoteInDatabase } from "@/contexts/notes/operations";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";

/**
 * Hook to handle note enhancement processing
 */
export const useEnhancementProcessor = (note: Note, editorState: {
  isEditing: boolean;
  setEditableContent: (content: string) => void;
}) => {
  const { isEditing, setEditableContent } = editorState;
  const { getEnhancementDetails } = useNoteEnrichment();
  
  // Handle content enhancement
  const handleEnhanceContent = async (enhancedContent: string, enhancementType?: EnhancementFunction) => {
    // If no enhancement type is provided, assume it's improve-clarity
    const typeToApply = enhancementType || 'improve-clarity';
    const enhancementDetails = getEnhancementDetails?.(typeToApply);
    
    console.log("Handling enhancement:", {
      typeToApply,
      replaceContent: enhancementDetails?.replaceContent,
      contentLength: enhancedContent.length
    });
    
    if (isEditing) {
      // If we're editing, just update the editable content
      setEditableContent(enhancedContent);
      toast.success("Enhancement applied to editor. Save to keep changes.");
      return;
    }
    
    // If not editing, directly update the note based on enhancement type
    try {
      // Check if this is a replacement type enhancement
      if (enhancementDetails?.replaceContent) {
        // For enhancements that replace content
        await updateNoteInDatabase(note.id, { content: enhancedContent });
          
        // Update local note
        note.content = enhancedContent;
        toast.success(`Content ${enhancementDetails.title.toLowerCase()} successfully`);
      } else {
        // For enhancements that create separate content
        if (typeToApply === 'summarize') {
          // Always store summary in its dedicated field
          await updateNoteInDatabase(note.id, {
            summary: enhancedContent,
            summary_generated_at: new Date().toISOString()
          });
            
          // Update local note
          note.summary = enhancedContent;
          note.summary_generated_at = new Date().toISOString();
          toast.success("Summary created successfully");
        } else {
          // Get current enhancements or create new object
          const currentEnhancements = note.enhancements || {};
          
          // Determine which field to update based on enhancement type
          let enhancementField: string;
          let successMessage: string;
          
          switch (typeToApply) {
            case 'extract-key-points':
              enhancementField = 'keyPoints';
              successMessage = "Key points extracted successfully";
              break;
            case 'convert-to-markdown':
              enhancementField = 'markdown';
              successMessage = "Converted to markdown successfully";
              break;
            case 'improve-clarity':
              enhancementField = 'improved';
              successMessage = "Improved clarity generated successfully";
              break;
            default:
              enhancementField = 'keyPoints';
              successMessage = "Enhancement completed successfully";
          }
          
          console.log(`Saving enhancement to ${enhancementField} field`);
          
          // Create updated enhancements object
          const updatedEnhancements = {
            ...currentEnhancements,
            [enhancementField]: enhancedContent,
            last_enhanced_at: new Date().toISOString()
          };
          
          // Update note in database
          await updateNoteInDatabase(note.id, {
            enhancements: updatedEnhancements
          });
          
          // Update local note
          note.enhancements = updatedEnhancements;
          toast.success(successMessage);
        }
      }
    } catch (error) {
      toast.error("Failed to save enhanced content");
      console.error("Error saving enhancement:", error);
    }
  };

  return {
    handleEnhanceContent
  };
};
