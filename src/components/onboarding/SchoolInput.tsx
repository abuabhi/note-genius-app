
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface SchoolInputProps {
  school: string;
  setSchool: (school: string) => void;
}

export const SchoolInput = ({ school, setSchool }: SchoolInputProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor="school" className="text-sm font-medium">
        School Name (Optional)
      </Label>
      <Input
        id="school"
        type="text"
        value={school}
        onChange={(e) => setSchool(e.target.value)}
        placeholder="Enter your school name"
      />
    </div>
  );
};
