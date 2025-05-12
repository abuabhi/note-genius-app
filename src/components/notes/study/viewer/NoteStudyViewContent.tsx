
import { useState } from "react";
import { CardContent } from "@/components/ui/card";
import { NoteContentDisplay } from "../NoteContentDisplay";
import { NoteStudyEditForm } from "../editor/NoteStudyEditForm";
import { EnhancementUsageMeter } from "./EnhancementUsageMeter";
import { Button } from "@/components/ui/button";
import { Brain, ChevronDown } from "lucide-react";
import { Note } from "@/types/note";
import { TextAlignType } from "../hooks/useStudyViewState";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { toast } from "sonner";

interface NoteStudyViewContentProps {
  note: Note;
  isEditing: boolean;
  fontSize: number;
  textAlign: TextAlignType;
  editableContent: string;
  selectedTags: { id?: string; name: string; color: string }[];
  availableTags: { id: string; name: string; color: string }[];
  isSaving: boolean;
  statsLoading?: boolean;
  currentUsage?: number;
  monthlyLimit?: number | null;
  handleContentChange: (html: string) => void;
  handleSaveContent: () => void;
  toggleEditing: () => void;
  handleEnhanceContent: (enhancedContent: string) => void;
  setSelectedTags: (tags: { id?: string; name: string; color: string }[]) => void;
  handleRetryEnhancement: (enhancementType: string) => Promise<void>;
  hasReachedLimit?: () => boolean;
  fetchUsageStats?: () => Promise<void>;
}

export const NoteStudyViewContent: React.FC<NoteStudyViewContentProps> = ({
  note,
  isEditing,
  fontSize,
  textAlign,
  editableContent,
  selectedTags,
  availableTags,
  isSaving,
  statsLoading = false,
  currentUsage = 0,
  monthlyLimit = null,
  handleContentChange,
  handleSaveContent,
  toggleEditing,
  handleEnhanceContent,
  setSelectedTags,
  handleRetryEnhancement,
  hasReachedLimit = () => false,
  fetchUsageStats = async () => {}
}) => {
  const [enhancementLoading, setEnhancementLoading] = useState<boolean>(false);
  const { enrichNote, enhancementOptions, isEnabled } = useNoteEnrichment();

  // Wrapper for retry enhancement to manage loading state
  const onRetryEnhancement = async (enhancementType: string) => {
    setEnhancementLoading(true);
    try {
      await handleRetryEnhancement(enhancementType);
    } finally {
      setEnhancementLoading(false);
    }
  };

  // Handle enhancement selection
  const handleEnhancementSelect = async (enhancement: EnhancementFunction) => {
    if (!note.id || !note.content) return;
    
    // Check if it's the "create-flashcards" option which is coming soon
    if (enhancement === 'create-flashcards') {
      toast.info("Coming Soon", {
        description: "Flashcard creation from notes will be available soon!"
      });
      return;
    }
    
    setEnhancementLoading(true);
    try {
      const result = await enrichNote(note.id, note.content, enhancement, note.title || "");
      
      if (result.success) {
        handleEnhanceContent(result.content);
      }
    } catch (error) {
      console.error("Error enhancing note:", error);
      toast.error("Failed to enhance note");
    } finally {
      setEnhancementLoading(false);
    }
  };

  // Group enhancement options by category for the dropdown
  const nonReplacementOptions = enhancementOptions.filter(opt => !opt.replaceContent);
  const replacementOptions = enhancementOptions.filter(opt => opt.replaceContent);

  const isLimitReached = hasReachedLimit();

  return (
    <CardContent className="p-4 md:p-6">
      {/* Show usage meter and AI button when not editing */}
      {!isEditing && (
        <div className="mb-4">
          <div className="flex justify-between items-center">
            <EnhancementUsageMeter 
              statsLoading={statsLoading}
              currentUsage={currentUsage}
              monthlyLimit={monthlyLimit}
            />
            
            {/* Use AI button with dropdown as per reference image */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white border border-mint-200 text-mint-700 hover:bg-mint-50 hover:text-mint-800 transition-all gap-1 group"
                  disabled={enhancementLoading || isLimitReached || !isEnabled}
                >
                  <Brain className="h-4 w-4 mr-1 group-hover:text-mint-600 transition-colors" />
                  Use AI
                  <ChevronDown className="h-3 w-3 ml-1 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {/* Non-replacement options */}
                {nonReplacementOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => handleEnhancementSelect(option.value as EnhancementFunction)}
                    className="cursor-pointer flex items-start p-2 rounded hover:bg-mint-50 focus:bg-mint-50 transition-colors"
                    disabled={enhancementLoading || option.value === 'create-flashcards'}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-mint-800">{option.title}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
                      {option.value === 'create-flashcards' && (
                        <span className="text-xs text-amber-600 mt-0.5 font-medium">Coming soon</span>
                      )}
                    </div>
                  </DropdownMenuItem>
                ))}

                {/* Separator between categories */}
                {nonReplacementOptions.length > 0 && replacementOptions.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <div className="px-2 py-1 text-xs text-muted-foreground">
                      Content Improvements
                    </div>
                  </>
                )}

                {/* Replacement options */}
                {replacementOptions.map((option) => (
                  <DropdownMenuItem
                    key={option.id}
                    onClick={() => handleEnhancementSelect(option.value as EnhancementFunction)}
                    className="cursor-pointer flex items-start p-2 rounded hover:bg-mint-50 focus:bg-mint-50 transition-colors"
                    disabled={enhancementLoading}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-mint-800">{option.title}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}
      
      {isEditing ? (
        <NoteStudyEditForm
          note={note}
          editableContent={editableContent}
          selectedTags={selectedTags}
          availableTags={availableTags}
          isSaving={isSaving}
          handleContentChange={handleContentChange}
          handleSaveContent={handleSaveContent}
          toggleEditing={toggleEditing}
          handleEnhanceContent={handleEnhanceContent}
          setSelectedTags={setSelectedTags}
        />
      ) : (
        <NoteContentDisplay
          note={note}
          content={note.content || ''}
          fontSize={fontSize}
          textAlign={textAlign}
          isEditing={isEditing}
          isLoading={enhancementLoading}
          onRetryEnhancement={onRetryEnhancement}
        />
      )}
    </CardContent>
  );
};
