
import { SimplifiedStudyModeSelector } from "@/components/study/SimplifiedStudyModeSelector";
import { FlashcardSet } from "@/types/flashcard";
import { StudyMode } from "./types";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { GraduationCap } from "lucide-react";

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
  const breadcrumbs = [
    { label: "Flashcards", href: "/flashcards" },
    { label: currentSet?.name || "Study Session" }
  ];

  const actions = !isLoading ? (
    <SimplifiedStudyModeSelector currentMode={mode} onModeChange={setMode} />
  ) : null;

  return (
    <StandardPageHeader
      title={isLoading ? "Loading..." : currentSet?.name || "Study Session"}
      description={isLoading ? "" : currentSet?.description || "Practice and review your flashcards"}
      icon={<GraduationCap className="h-6 w-6 text-white" />}
      breadcrumbs={breadcrumbs}
      actions={actions}
    />
  );
};
