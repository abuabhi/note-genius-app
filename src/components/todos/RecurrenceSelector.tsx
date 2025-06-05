
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RecurrenceType } from "@/hooks/todos/types";
import { Repeat, Clock } from "lucide-react";

interface RecurrenceSelectorProps {
  value: RecurrenceType;
  onValueChange: (value: RecurrenceType) => void;
  endDate?: Date;
  onEndDateChange: (date: Date | undefined) => void;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  value,
  onValueChange,
  endDate,
  onEndDateChange
}) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Repeat className="h-4 w-4 text-muted-foreground" />
        <Label>Repeat</Label>
      </div>
      
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select recurrence" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="none">
            <div className="flex items-center gap-2">
              <span>No repeat</span>
            </div>
          </SelectItem>
          <SelectItem value="daily">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Daily</span>
            </div>
          </SelectItem>
          <SelectItem value="weekly">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Weekly</span>
            </div>
          </SelectItem>
          <SelectItem value="monthly">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Monthly</span>
            </div>
          </SelectItem>
          <SelectItem value="yearly">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3" />
              <span>Yearly</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      {value !== "none" && (
        <div className="mt-3">
          <Label className="text-sm text-muted-foreground">End Date (Optional)</Label>
          <input
            type="date"
            value={endDate ? endDate.toISOString().split('T')[0] : ''}
            onChange={(e) => onEndDateChange(e.target.value ? new Date(e.target.value) : undefined)}
            className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
      )}
    </div>
  );
};
