import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap } from "lucide-react";
import { GradeLevel, GRADE_LEVELS } from "@/types/subject";

interface GradeSelectionProps {
  grade: GradeLevel | "";
  setGrade: (grade: GradeLevel) => void;
}

export const GradeSelection = ({ grade, setGrade }: GradeSelectionProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
      <GraduationCap className="h-4 w-4 text-mint-600" />
      Grade / Year <span className="text-red-500">*</span>
    </Label>
    <Select value={grade} onValueChange={(v) => setGrade(v as GradeLevel)}>
      <SelectTrigger className="border-mint-200 focus:border-mint-500 focus:ring-mint-500">
        <SelectValue placeholder="Select your grade or year" />
      </SelectTrigger>
      <SelectContent>
        {GRADE_LEVELS.map((g) => (
          <SelectItem key={g} value={g}>{g}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
