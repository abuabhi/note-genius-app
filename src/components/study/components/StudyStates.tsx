
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const StudyLoadingState = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading flashcards...</p>
      </div>
    </div>
  );
};

export const StudyErrorState = ({ error }: { error: string }) => {
  return (
    <div className="text-center py-12">
      <div className="text-red-600 mb-4">{error}</div>
      <Button onClick={() => window.location.reload()}>Try Again</Button>
    </div>
  );
};

export const StudyEmptyState = () => {
  return (
    <div className="text-center py-12">
      <p className="text-muted-foreground mb-4">No flashcards available for this mode.</p>
      <Button onClick={() => window.history.back()}>Go Back</Button>
    </div>
  );
};
