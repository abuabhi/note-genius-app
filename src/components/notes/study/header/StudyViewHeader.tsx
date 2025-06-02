
import { useState, useEffect } from "react";
import { CardHeader } from "@/components/ui/card";
import { Note } from "@/types/note";
import { StudyViewControls } from "../controls/StudyViewControls";
import { TextAlignType } from "../hooks/useStudyViewState";
import { Input } from "@/components/ui/input";
import { NoteHeader } from "../../details/NoteHeader";
import { NoteTagList } from "../../details/NoteTagList";
import { Brain, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { useNoteEnrichment } from "@/hooks/useNoteEnrichment";
import { EnhancementFunction } from "@/hooks/noteEnrichment/types";
import { toast } from "sonner";

interface StudyViewHeaderProps {
  note: Note;
  fontSize: number;
  textAlign: TextAlignType;
  isFullWidth: boolean;
  isFullScreen: boolean;
  isEditing: boolean;
  isSaving: boolean;
  editableTitle: string;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
  onChangeTextAlign: (align: TextAlignType) => void;
  onToggleWidth: () => void;
  onToggleFullScreen: () => void;
  onToggleEditing: () => void;
  onSave: () => void;
  onTitleChange: (title: string) => void;
  onEnhance: (enhancedContent: string, enhancementType?: EnhancementFunction) => void;
}

export const StudyViewHeader = ({
  note,
  fontSize,
  textAlign,
  isFullWidth,
  isFullScreen,
  isEditing,
  isSaving,
  editableTitle,
  onIncreaseFontSize,
  onDecreaseFontSize,
  onChangeTextAlign,
  onToggleWidth,
  onToggleFullScreen,
  onToggleEditing,
  onSave,
  onTitleChange,
  onEnhance,
}: StudyViewHeaderProps) => {
  const [title, setTitle] = useState(note?.title || "");
  const { enrichNote, enhancementOptions, isProcessing } = useNoteEnrichment();

  useEffect(() => {
    setTitle(editableTitle || note?.title || "");
  }, [editableTitle, note?.title]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    onTitleChange(newTitle);
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
    
    try {
      const result = await enrichNote(note.id, note.content, enhancement, note.title || "");
      
      if (result.success) {
        onEnhance(result.content, enhancement);
      }
    } catch (error) {
      console.error("Error enhancing note:", error);
      toast.error("Failed to enhance note");
    }
  };

  // Group enhancement options by category for the dropdown
  const nonReplacementOptions = enhancementOptions.filter(opt => !opt.replaceContent);
  const replacementOptions = enhancementOptions.filter(opt => opt.replaceContent);

  return (
    <CardHeader className="border-b p-4 bg-card">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex-1 w-full sm:w-auto">
          {isEditing ? (
            <Input
              value={title}
              onChange={handleTitleChange}
              className="font-medium text-lg border-mint-200 focus-visible:ring-mint-400"
              placeholder="Note Title"
            />
          ) : (
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-green-700">{note?.title}</h2>
              <div className="text-sm flex flex-wrap gap-2 items-center">
                <span className="font-bold text-gray-600">{note?.date}</span>
                {note?.category && (
                  <span className="text-green-600 font-medium">{note?.category}</span>
                )}
              </div>
              {note?.tags && note?.tags.length > 0 && (
                <div className="mt-2">
                  <NoteTagList tags={note?.tags} />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {!isEditing && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white border border-mint-200 text-mint-700 hover:bg-mint-50 hover:text-mint-800 transition-all gap-1 group h-8"
                  disabled={isProcessing}
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
                    disabled={isProcessing || option.value === 'create-flashcards'}
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
                    disabled={isProcessing}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium text-mint-800">{option.title}</span>
                      <span className="text-xs text-muted-foreground mt-0.5">{option.description}</span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <StudyViewControls
            fontSize={fontSize}
            textAlign={textAlign}
            isFullWidth={isFullWidth}
            isFullScreen={isFullScreen}
            isEditing={isEditing}
            isSaving={isSaving}
            hideAlignment={true}
            onIncreaseFontSize={onIncreaseFontSize}
            onDecreaseFontSize={onDecreaseFontSize}
            onChangeTextAlign={onChangeTextAlign}
            onToggleWidth={onToggleWidth}
            onToggleFullScreen={onToggleFullScreen}
            onToggleEditing={onToggleEditing}
            onSave={onSave}
          />
        </div>
      </div>
    </CardHeader>
  );
};
