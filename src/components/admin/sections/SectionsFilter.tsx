
import React from "react";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";
import { SubjectCategory } from "@/types/flashcard";

interface SectionsFilterProps {
  filterSubject: string;
  setFilterSubject: (value: string) => void;
  categories: SubjectCategory[];
}

const SectionsFilter = ({
  filterSubject,
  setFilterSubject,
  categories,
}: SectionsFilterProps) => {
  return (
    <div className="mb-4">
      <div className="flex items-center space-x-2">
        <Filter className="h-4 w-4 text-muted-foreground" />
        <Label htmlFor="filter-subject">Filter by Subject:</Label>
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger id="filter-subject" className="w-[200px]">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Subjects</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default SectionsFilter;
