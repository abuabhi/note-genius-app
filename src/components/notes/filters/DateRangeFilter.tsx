
import { Input } from "@/components/ui/input";
import { FilterOption } from "./FilterOption";

interface DateRangeFilterProps {
  dateFrom?: string;
  dateTo?: string;
  onDateFromChange: (date: string | undefined) => void;
  onDateToChange: (date: string | undefined) => void;
}

export const DateRangeFilter = ({
  dateFrom,
  dateTo,
  onDateFromChange,
  onDateToChange
}: DateRangeFilterProps) => {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="space-y-2">
        <Label htmlFor="dateFrom">Date from</Label>
        <Input
          id="dateFrom"
          type="date"
          value={dateFrom || ""}
          onChange={(e) => onDateFromChange(e.target.value || undefined)}
          className="border-purple-200 focus-visible:ring-purple-400"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateTo">Date to</Label>
        <Input
          id="dateTo"
          type="date"
          value={dateTo || ""}
          onChange={(e) => onDateToChange(e.target.value || undefined)}
          className="border-purple-200 focus-visible:ring-purple-400"
        />
      </div>
    </div>
  );
};

// Add missing import
import { Label } from "@/components/ui/label";
