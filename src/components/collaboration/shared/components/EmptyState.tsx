
import { UserCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const EmptyState = () => {
  return (
    <Card className="text-center p-6">
      <CardContent className="pt-6 flex flex-col items-center">
        <UserCheck className="h-16 w-16 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">You Haven't Shared Anything Yet</h3>
        <p className="text-muted-foreground">
          Share your flashcard sets with others to collaborate and study together.
        </p>
      </CardContent>
    </Card>
  );
};

export default EmptyState;
