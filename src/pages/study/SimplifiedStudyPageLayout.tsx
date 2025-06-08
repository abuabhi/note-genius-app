
import { SimplifiedFlashcardStudy } from "@/components/study/SimplifiedFlashcardStudy";
import { SimplifiedStudyProgress } from "@/components/study/SimplifiedStudyProgress";
import { StudyMode } from "./types";

interface SimplifiedStudyPageLayoutProps {
  isLoading: boolean;
  setId: string;
  mode: StudyMode;
  currentSet?: any;
}

export const SimplifiedStudyPageLayout = ({
  isLoading,
  setId,
  mode,
  currentSet
}: SimplifiedStudyPageLayoutProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-mint-600 mx-auto mb-4"></div>
              <p>Loading flashcards...</p>
            </div>
          </div>
        ) : (
          <SimplifiedFlashcardStudy 
            setId={setId} 
            mode={mode} 
            currentSet={currentSet} 
          />
        )}
      </div>
      
      <div className="lg:col-span-1">
        <SimplifiedStudyProgress />
      </div>
    </div>
  );
};
