
import { Button } from "@/components/ui/button";
import { Award } from "lucide-react";

interface EmptyAchievementsStateProps {
  onCheckAchievements: () => Promise<void>;
}

export const EmptyAchievementsState = ({ onCheckAchievements }: EmptyAchievementsStateProps) => {
  return (
    <div className="text-center py-8">
      <Award className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Start Your Journey!</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Begin studying to unlock achievements and track your progress!
      </p>
      <Button onClick={onCheckAchievements}>
        Check for Achievements
      </Button>
    </div>
  );
};
