
import { Button } from "@/components/ui/button";

interface StudyControlsProps {
  onScore: (score: number) => void;
}

export const StudyControls = ({ onScore }: StudyControlsProps) => {
  return (
    <div className="mt-6 bg-muted p-4 rounded-lg">
      <p className="text-sm text-center mb-3">How well did you know this?</p>
      <div className="grid grid-cols-3 gap-2 md:flex md:justify-between">
        <Button 
          variant="outline" 
          className="border-red-300 hover:bg-red-100 hover:text-red-900" 
          onClick={() => onScore(1)}
        >
          Again
        </Button>
        <Button 
          variant="outline" 
          className="border-orange-300 hover:bg-orange-100 hover:text-orange-900" 
          onClick={() => onScore(2)}
        >
          Hard
        </Button>
        <Button 
          variant="outline" 
          className="border-yellow-300 hover:bg-yellow-100 hover:text-yellow-900" 
          onClick={() => onScore(3)}
        >
          Good
        </Button>
        <Button 
          variant="outline" 
          className="border-green-300 hover:bg-green-100 hover:text-green-900 hidden md:inline-flex" 
          onClick={() => onScore(4)}
        >
          Easy
        </Button>
        <Button 
          variant="outline" 
          className="border-green-500 hover:bg-green-100 hover:text-green-900 hidden md:inline-flex" 
          onClick={() => onScore(5)}
        >
          Perfect
        </Button>
      </div>
    </div>
  );
};
