
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { updateNoteInDatabase } from "@/contexts/notes/operations";
import { Note } from "@/types/note";
import { useNotes } from "@/contexts/NoteContext";
import { supabase } from "@/integrations/supabase/client";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";

export const useNoteStudyEditor = (note: Note) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTitle, setEditableTitle] = useState(note.title || '');
  const [editableContent, setEditableContent] = useState(note.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTags, setSelectedTags] = useState<{ id?: string; name: string; color: string }[]>(
    // Create a deep copy of the tags to prevent reference issues
    (note.tags || []).map(tag => ({...tag}))
  );
  const { getAllTags } = useNotes();
  const { getEnhancementDetails } = useNoteEnrichment();
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);
  
  // Fetch available tags when component mounts
  useEffect(() => {
    const loadTags = async () => {
      const tags = await getAllTags();
      setAvailableTags(tags);
    };
    loadTags();
  }, [getAllTags]);

  // Toggle editing state
  const toggleEditing = () => {
    if (isEditing) {
      // Cancel editing, restore original content
      setEditableContent(note.content || '');
      setEditableTitle(note.title || '');
      // Create a deep copy of the original tags
      setSelectedTags((note.tags || []).map(tag => ({...tag})));
    } else {
      // Start editing
      setEditableContent(note.content || '');
      setEditableTitle(note.title || '');
      // Create a deep copy of the original tags
      setSelectedTags((note.tags || []).map(tag => ({...tag})));
    }
    setIsEditing(!isEditing);
  };
  
  // Handle content changes
  const handleContentChange = (html: string) => {
    setEditableContent(html);
  };
  
  // Handle title changes
  const handleTitleChange = (title: string) => {
    setEditableTitle(title);
  };
  
  // Save content changes
  const handleSaveContent = async () => {
    // Check if anything changed
    const tagsChanged = JSON.stringify(selectedTags) !== JSON.stringify(note.tags);
    
    if (editableContent === note.content && 
        editableTitle === note.title &&
        !tagsChanged) {
      setIsEditing(false);
      return;
    }
    
    setIsSaving(true);
    try {
      await updateNoteInDatabase(note.id, {
        content: editableContent,
        title: editableTitle,
        tags: selectedTags
      });
      toast.success("Note updated successfully");
      // We need to update the note in our view
      note.content = editableContent;
      note.title = editableTitle;
      // Create a deep copy to prevent reference issues
      note.tags = selectedTags.map(tag => ({...tag}));
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to save changes", {
        description: "Please try again"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle content enhancement
  const handleEnhanceContent = async (enhancedContent: string, enhancementType?: EnhancementFunction) => {
    // If no enhancement type is provided, assume it's improve-clarity
    const typeToApply = enhancementType || 'improve-clarity';
    const enhancementDetails = getEnhancementDetails?.(typeToApply);
    
    if (isEditing) {
      // If we're editing, just update the editable content
      setEditableContent(enhancedContent);
      toast.success("Enhancement applied to editor. Save to keep changes.");
      return;
    }
    
    // If not editing, directly update the note based on enhancement type
    setIsSaving(true);
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
          await updateNoteInDatabase(note.id, {
            summary: enhancedContent,
            summary_generated_at: new Date().toISOString()
          });
            
          // Update local note
          note.summary = enhancedContent;
          note.summary_generated_at = new Date().toISOString();
          toast.success("Summary created successfully");
        } else if (typeToApply === 'extract-key-points' || 
                  typeToApply === 'convert-to-markdown' || 
                  typeToApply === 'improve-clarity') {
          
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
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isEditing,
    editableTitle,
    editableContent,
    selectedTags,
    availableTags,
    isSaving,
    toggleEditing,
    handleTitleChange,
    handleContentChange,
    handleSaveContent,
    handleEnhanceContent,
    setSelectedTags
  };
};
