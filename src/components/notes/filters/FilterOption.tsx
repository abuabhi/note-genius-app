
import { Label } from "@/components/ui/label";
import { ReactNode } from "react";

interface FilterOptionProps {
  label: string;
  children: ReactNode;
}

export const FilterOption = ({ label, children }: FilterOptionProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={label}>{label}</Label>
      {children}
    </div>
  );
};
