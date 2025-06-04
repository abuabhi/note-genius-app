
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterOption } from "./FilterOption";
import { useUserSubjects } from "@/hooks/useUserSubjects";

interface CategoryFilterProps {
  category?: string;
  availableCategories: string[];
  onCategoryChange: (category: string | undefined) => void;
}

export const CategoryFilter = ({
  category,
  availableCategories,
  onCategoryChange
}: CategoryFilterProps) => {
  const { subjects } = useUserSubjects();
  
  // Use only user subjects, ignore availableCategories (which are note titles)
  const userSubjects = subjects || [];
  
  return (
    <FilterOption label="Subject">
      <Select
        value={category || "_any"}
        onValueChange={(value) => 
          onCategoryChange(value === "_any" ? undefined : value)
        }
      >
        <SelectTrigger id="category" className="border-mint-200 focus:ring-mint-400">
          <SelectValue placeholder="Any subject" />
        </SelectTrigger>
        <SelectContent className="bg-white">
          <SelectItem value="_any">Any subject</SelectItem>
          
          {userSubjects.map(subject => (
            <SelectItem key={subject.id} value={subject.name}>
              {subject.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterOption>
  );
};
