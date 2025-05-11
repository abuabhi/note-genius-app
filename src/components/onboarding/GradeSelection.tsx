
import { Label } from "@/components/ui/label";
import { GradeLevel, GRADE_LEVELS } from "@/types/subject";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface GradeSelectionProps {
  grade: GradeLevel | "";
  setGrade: (grade: GradeLevel) => void;
}

export const GradeSelection = ({ grade, setGrade }: GradeSelectionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="grade" className="text-sm font-medium">
        Grade/Education Level <span className="text-red-500">*</span>
      </Label>
      <Select 
        value={grade} 
        onValueChange={(value: string) => setGrade(value as GradeLevel)}
        required
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select your grade/level" />
        </SelectTrigger>
        <SelectContent>
          {GRADE_LEVELS.map((gradeLevel) => (
            <SelectItem key={gradeLevel} value={gradeLevel}>
              {gradeLevel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
