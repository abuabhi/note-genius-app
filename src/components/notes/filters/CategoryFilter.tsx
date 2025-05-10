
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FilterOption } from "./FilterOption";

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
  return (
    <FilterOption label="Subject">
      <Select
        value={category || ""}
        onValueChange={(value) => 
          onCategoryChange(value === "" ? undefined : value)
        }
      >
        <SelectTrigger id="category" className="border-purple-200 focus:ring-purple-400">
          <SelectValue placeholder="Any subject" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Any subject</SelectItem>
          {availableCategories.map(category => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterOption>
  );
};
