
import { Checkbox } from "@/components/ui/checkbox";
import { FilterOption } from "./FilterOption";

interface SourceTypeFilterProps {
  sourceType?: ('manual' | 'scan' | 'import')[];
  onSourceTypeChange: (sourceType: ('manual' | 'scan' | 'import')[]) => void;
}

export const SourceTypeFilter = ({
  sourceType = [],
  onSourceTypeChange
}: SourceTypeFilterProps) => {
  const handleChange = (type: 'manual' | 'scan' | 'import', isChecked: boolean) => {
    if (isChecked) {
      onSourceTypeChange([...sourceType, type]);
    } else {
      onSourceTypeChange(sourceType.filter(t => t !== type));
    }
  };

  return (
    <FilterOption label="Source Type">
      <div className="flex flex-col gap-2 mt-1">
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="manual" 
            checked={sourceType.includes('manual')}
            onCheckedChange={(checked) => handleChange('manual', checked === true)}
          />
          <label
            htmlFor="manual"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Manual Entry
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="scan" 
            checked={sourceType.includes('scan')}
            onCheckedChange={(checked) => handleChange('scan', checked === true)}
          />
          <label
            htmlFor="scan"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Scanned Documents
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox 
            id="import" 
            checked={sourceType.includes('import')}
            onCheckedChange={(checked) => handleChange('import', checked === true)}
          />
          <label
            htmlFor="import"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Imported Files
          </label>
        </div>
      </div>
    </FilterOption>
  );
};
