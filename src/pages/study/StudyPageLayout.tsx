
import { SimpleFlashcardStudy } from "@/components/study/SimpleFlashcardStudy";
import { StandaloneStudyProgress } from "@/components/study/StandaloneStudyProgress";
import { StudyMode } from "./types";

interface StudyPageLayoutProps {
  isLoading: boolean;
  setId: string;
  mode: StudyMode;
}

export const StudyPageLayout = ({
  isLoading,
  setId,
  mode
}: StudyPageLayoutProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="md:col-span-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading flashcards...</p>
            </div>
          </div>
        ) : (
          <SimpleFlashcardStudy setId={setId} mode={mode} />
        )}
      </div>
      
      <div className="md:col-span-1">
        <StandaloneStudyProgress />
      </div>
    </div>
  );
};
