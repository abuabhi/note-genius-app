
import { toast } from "sonner";
import { Note } from "@/types/note";
import { updateNoteInDatabase } from "@/contexts/notes/operations";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { useNotes } from "@/contexts/NoteContext";
import { useState } from "react";

/**
 * Hook to handle note enhancement processing with improved debugging
 */
export const useEnhancementProcessor = (note: Note, editorState: {
  isEditing: boolean;
  setEditableContent: (content: string) => void;
}) => {
  const { isEditing, setEditableContent } = editorState;
  const { getEnhancementDetails } = useNoteEnrichment();
  const { updateNote } = useNotes();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [processingError, setProcessingError] = useState<string | null>(null);
  
  // Handle content enhancement with comprehensive debugging
  const handleEnhanceContent = async (enhancedContent: string, enhancementType?: EnhancementFunction) => {
    console.log("🚀 Starting enhancement process:", {
      noteId: note.id,
      enhancementType,
      contentLength: enhancedContent.length,
      isEditing,
      timestamp: new Date().toISOString()
    });

    setProcessingError(null);
    setIsProcessing(true);
    
    try {
      const typeToApply = enhancementType || 'improve-clarity';
      const enhancementDetails = getEnhancementDetails?.(typeToApply);
      
      console.log("📝 Enhancement details:", {
        typeToApply,
        replaceContent: enhancementDetails?.replaceContent,
        enhancementDetails
      });
      
      // If we're editing and it's a replacement type enhancement, update the editable content
      if (isEditing && enhancementDetails?.replaceContent) {
        console.log("✏️ Updating editable content in editor mode");
        setEditableContent(enhancedContent);
        toast.success("Enhancement applied to editor. Save to keep changes.");
        return;
      }
      
      // Prepare update data based on enhancement type
      const now = new Date().toISOString();
      let updateData: Partial<Note> = {};
      
      switch (typeToApply) {
        case 'summarize':
          console.log("📄 Storing summary content");
            updateData = {
              summary: enhancedContent,
              summary_generated_at: now,
              summary_status: 'completed'
            };
            break;
            
        case 'extract-key-points':
          console.log("🔑 Storing key points content");
          updateData = {
            key_points: enhancedContent,
            key_points_generated_at: now
          };
          break;
            
        case 'convert-to-markdown':
          console.log("📋 Storing markdown content");
          updateData = {
            markdown_content: enhancedContent,
            markdown_content_generated_at: now
          };
          break;
            
        case 'improve-clarity':
          console.log("✨ Storing improved clarity content");
          if (enhancementDetails?.replaceContent) {
            updateData = { content: enhancedContent };
          } else {
            updateData = {
              improved_content: enhancedContent,
              improved_content_generated_at: now
            };
          }
          break;
            
        default:
          console.log("📝 Defaulting to summary storage");
          updateData = {
            summary: enhancedContent,
            summary_generated_at: now,
            summary_status: 'completed'
          };
      }
      
      console.log("💾 Update data prepared:", {
        updateData,
        fieldsToUpdate: Object.keys(updateData)
      });
        
      // First update the database
      console.log("🗄️ Updating database...");
      await updateNoteInDatabase(note.id, updateData);
      console.log("✅ Database updated successfully");
        
      // Then immediately update the context state to trigger re-renders
      console.log("🔄 Updating context state...");
      await updateNote(note.id, updateData);
      console.log("✅ Context state updated successfully");
        
      // Force a small delay to ensure state propagation
      await new Promise(resolve => setTimeout(resolve, 100));
        
      console.log("🎉 Enhancement process completed:", {
        noteId: note.id,
        updateData,
        enhancementType: typeToApply,
        timestamp: new Date().toISOString()
      });
        
      // Show success message
      const successMessages = {
        'summarize': "Summary created successfully",
        'extract-key-points': "Key points extracted successfully", 
        'convert-to-markdown': "Converted to markdown successfully",
        'improve-clarity': enhancementDetails?.replaceContent ? "Content improved successfully" : "Improved clarity generated successfully"
      };
        
      toast.success(successMessages[typeToApply] || "Enhancement completed successfully");
        
    } catch (error) {
      console.error("❌ Error in enhancement process:", error);
      setProcessingError(error instanceof Error ? error.message : "An unknown error occurred");
      toast.error(`Failed to save enhanced content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Function to retry a failed enhancement
  const retryEnhancement = async (content: string, enhancementType?: EnhancementFunction) => {
    console.log("🔄 Retrying enhancement:", { enhancementType });
    setProcessingError(null);
    await handleEnhanceContent(content, enhancementType);
  };

  return {
    handleEnhanceContent,
    retryEnhancement,
    isProcessing,
    processingError
  };
};
