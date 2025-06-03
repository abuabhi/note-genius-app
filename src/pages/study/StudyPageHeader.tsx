
import { SimplifiedStudyModeSelector } from "@/components/study/SimplifiedStudyModeSelector";
import { FlashcardSet } from "@/types/flashcard";
import { StudyMode } from "./types";

interface StudyPageHeaderProps {
  isLoading: boolean;
  currentSet: FlashcardSet | null;
  mode: StudyMode;
  setMode: (mode: StudyMode) => void;
}

export const StudyPageHeader = ({
  isLoading,
  currentSet,
  mode,
  setMode
}: StudyPageHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold">
          {isLoading ? "Loading..." : currentSet?.name || "Study Session"}
        </h1>
        <p className="text-muted-foreground">
          {isLoading ? "" : currentSet?.description || "Practice and review your flashcards"}
        </p>
      </div>
      
      {!isLoading && <SimplifiedStudyModeSelector mode={mode} setMode={setMode} />}
    </div>
  );
};
