import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface SubjectSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export const SubjectSelector = ({ 
  value, 
  onValueChange, 
  required = false,
  className = "" 
}: SubjectSelectorProps) => {
  const { subjects, isLoading } = useUserSubjects();

  // Only show user's selected subjects from onboarding
  const userSubjects = subjects.map(s => s.name);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor="subject-select">
        Subject {required && <span className="text-destructive">*</span>}
      </Label>
      <Select value={value} onValueChange={onValueChange} disabled={isLoading}>
        <SelectTrigger id="subject-select">
          <SelectValue placeholder={isLoading ? "Loading subjects..." : "Select a subject"} />
        </SelectTrigger>
        <SelectContent>
          {userSubjects.map((subject) => (
            <SelectItem key={subject} value={subject}>
              {subject}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};