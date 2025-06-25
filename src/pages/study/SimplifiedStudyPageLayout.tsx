
import { SimplifiedFlashcardStudy } from "@/components/study/SimplifiedFlashcardStudy";
import { StudyMode } from "./types";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

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
  
  console.log('SimplifiedStudyPageLayout: Rendering with props:', {
    isLoading,
    setId,
    mode,
    hasCurrentSet: !!currentSet
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="border rounded-lg p-8">
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="flex justify-center gap-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    );
  }

  if (!setId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No flashcard set ID provided. Please select a flashcard set to study.
        </AlertDescription>
      </Alert>
    );
  }

  // Use the SimplifiedFlashcardStudy component which handles all the complexity
  return <SimplifiedFlashcardStudy setId={setId} mode={mode} />;
};
