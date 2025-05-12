
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
        if (typeToApply === 'summarize' || typeToApply === 'extract-key-points') {
          // Store in summary field
          await updateNoteInDatabase(note.id, {
            summary: enhancedContent,
            summary_generated_at: new Date().toISOString()
          });
            
          // Update local note
          note.summary = enhancedContent;
          note.summary_generated_at = new Date().toISOString();
          
          // Set toast message based on enhancement type
          const message = typeToApply === 'summarize' ? 
            "Summary created successfully" :
            "Key points extracted successfully";
          
          toast.success(message);
        } else {
          // Store other enhancement types in summary field as well
          await updateNoteInDatabase(note.id, {
            summary: enhancedContent,
            summary_generated_at: new Date().toISOString()
          });
          
          // Update local note
          note.summary = enhancedContent;
          note.summary_generated_at = new Date().toISOString();
          
          // Determine success message based on enhancement type
          let successMessage: string;
          
          switch (typeToApply) {
            case 'convert-to-markdown':
              successMessage = "Converted to markdown successfully";
              break;
            case 'improve-clarity':
              successMessage = "Improved clarity generated successfully";
              break;
            default:
              successMessage = "Enhancement completed successfully";
          }
          
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
