
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
  // Filter out empty categories and duplicates
  const uniqueCategories = [...new Set(availableCategories)]
    .filter(category => category && category.trim() !== '')
    .sort();

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
          {uniqueCategories.map(category => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterOption>
  );
};
