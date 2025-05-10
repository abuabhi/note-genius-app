
import { Checkbox } from "@/components/ui/checkbox";
import { FilterOption } from "./FilterOption";

interface SourceTypeFilterProps {
  selectedTypes?: ('manual' | 'scan' | 'import')[];
  onSourceTypeChange: (type: 'manual' | 'scan' | 'import', checked: boolean) => void;
}

export const SourceTypeFilter = ({
  selectedTypes = [],
  onSourceTypeChange
}: SourceTypeFilterProps) => {
  const sourceTypes: ('manual' | 'scan' | 'import')[] = ["manual", "scan", "import"];
  
  return (
    <FilterOption label="Source type">
      <div className="grid grid-cols-3 gap-2">
        {sourceTypes.map((type) => (
          <div key={type} className="flex items-center space-x-2">
            <Checkbox
              id={`type-${type}`}
              checked={selectedTypes?.includes(type) || false}
              onCheckedChange={(checked) => onSourceTypeChange(type, checked === true)}
              className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
            />
            <label
              htmlFor={`type-${type}`}
              className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </label>
          </div>
        ))}
      </div>
    </FilterOption>
  );
};
