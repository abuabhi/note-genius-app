import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GraduationCap } from "lucide-react";

interface GradeSelectionProps {
  grade: string;
  setGrade: (grade: string) => void;
}

const GRADES = [
  "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10",
  "Grade 11", "Grade 12", "University Year 1", "University Year 2",
  "University Year 3", "University Year 4", "Graduate", "Other",
];

export const GradeSelection = ({ grade, setGrade }: GradeSelectionProps) => (
  <div className="space-y-2">
    <Label className="text-sm font-medium text-slate-700 flex items-center gap-2">
      <GraduationCap className="h-4 w-4 text-mint-600" />
      Grade / Year <span className="text-red-500">*</span>
    </Label>
    <Select value={grade} onValueChange={setGrade}>
      <SelectTrigger className="border-mint-200 focus:border-mint-500 focus:ring-mint-500">
        <SelectValue placeholder="Select your grade or year" />
      </SelectTrigger>
      <SelectContent>
        {GRADES.map((g) => (
          <SelectItem key={g} value={g}>{g}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </div>
);
