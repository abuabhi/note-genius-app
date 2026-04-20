import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School } from "lucide-react";

interface SchoolInputProps {
  school: string;
  setSchool: (school: string) => void;
}

export const SchoolInput = ({ school, setSchool }: SchoolInputProps) => (
  <div className="space-y-2">
    <Label htmlFor="school" className="text-sm font-medium text-slate-700 flex items-center gap-2">
      <School className="h-4 w-4 text-mint-600" />
      School / Institution <span className="text-slate-400 text-xs">(optional)</span>
    </Label>
    <Input
      id="school"
      type="text"
      value={school}
      onChange={(e) => setSchool(e.target.value)}
      placeholder="e.g. Lincoln High School"
      className="border-mint-200 focus:border-mint-500 focus:ring-mint-500"
    />
  </div>
);
