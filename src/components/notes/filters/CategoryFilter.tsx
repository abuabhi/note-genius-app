
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
  
  // Helper function to check if a category name already exists as a subject
  const isCategoryExistingSubject = (categoryName: string): boolean => {
    return subjects.some(subject => 
      subject.name.toLowerCase() === categoryName.toLowerCase()
    );
  };
  
  // Filter out empty categories, duplicates, and categories that overlap with subjects
  const getUniqueCategories = () => {
    return [...new Set(availableCategories)]
      .filter(category => 
        category && 
        category.trim() !== '' &&
        !isCategoryExistingSubject(category)
      )
      .sort();
  };
  
  const uniqueCategories = getUniqueCategories();
  
  // Combine user subjects and other unique categories
  const allOptions = [
    ...subjects.map(subject => ({ 
      id: subject.id, 
      name: subject.name, 
      isSubject: true 
    })),
    ...uniqueCategories.map(category => ({ 
      id: category, 
      name: category, 
      isSubject: false 
    }))
  ].sort((a, b) => a.name.localeCompare(b.name));

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
          
          {allOptions.map(option => (
            <SelectItem key={option.id} value={option.name}>
              {option.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </FilterOption>
  );
};
