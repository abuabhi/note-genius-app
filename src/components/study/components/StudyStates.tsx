
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const StudyLoadingState = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="min-h-[300px] flex flex-col items-center justify-center space-y-4">
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-4 w-2/5" />
        </div>
      </CardContent>
    </Card>
  );
};

export const StudyErrorState = ({ error }: { error: string }) => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold text-red-600">Error</h3>
          <p className="text-muted-foreground mt-2">{error}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export const StudyEmptyState = () => {
  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="min-h-[300px] flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-semibold">No flashcards in this set</h3>
          <p className="text-muted-foreground mt-2">
            Add some flashcards to this set to start studying.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
