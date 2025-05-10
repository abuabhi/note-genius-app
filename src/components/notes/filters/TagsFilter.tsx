
import { Checkbox } from "@/components/ui/checkbox";
import { FilterOption } from "./FilterOption";

interface TagsFilterProps {
  hasTags?: boolean;
  onHasTagsChange: (hasTags: boolean | undefined) => void;
}

export const TagsFilter = ({
  hasTags,
  onHasTagsChange
}: TagsFilterProps) => {
  return (
    <FilterOption label="Tags">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="has-tags"
          checked={hasTags === true}
          onCheckedChange={(checked) => {
            onHasTagsChange(checked === 'indeterminate' ? undefined : checked === true);
          }}
          className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
        />
        <label
          htmlFor="has-tags"
          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Has tags
        </label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="no-tags"
          checked={hasTags === false}
          onCheckedChange={(checked) => {
            onHasTagsChange(checked === 'indeterminate' ? undefined : checked === false ? false : undefined);
          }}
          className="border-purple-300 data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
        />
        <label
          htmlFor="no-tags"
          className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          No tags
        </label>
      </div>
    </FilterOption>
  );
};
