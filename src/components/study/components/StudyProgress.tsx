
import { Progress } from "@/components/ui/progress";

interface StudyProgressProps {
  currentIndex: number;
  totalCards: number;
  streak: number;
}

export const StudyProgressDisplay = ({ currentIndex, totalCards, streak }: StudyProgressProps) => {
  return (
    <>
      <Progress value={(currentIndex + 1) / totalCards * 100} className="mb-6" />
      
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {totalCards}
          {streak > 0 && <span className="ml-2">• Streak: {streak}</span>}
        </p>
      </div>
    </>
  );
};
