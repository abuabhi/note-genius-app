
import React from "react";
import { Filter } from "lucide-react";
import { UserTier } from "@/hooks/useRequireAuth";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface FilterDropdownProps {
  filter: string;
  setFilter: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({ filter, setFilter }) => {
  return (
    <div className="flex items-center space-x-2 w-full sm:w-auto">
      <Filter className="h-4 w-4 text-muted-foreground" />
      <Select value={filter} onValueChange={setFilter}>
        <SelectTrigger className="w-full sm:w-[180px]">
          <SelectValue placeholder="Filter by tier" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Tiers</SelectItem>
          <SelectItem value={UserTier.SCHOLAR}>Scholar</SelectItem>
          <SelectItem value={UserTier.GRADUATE}>Graduate</SelectItem>
          <SelectItem value={UserTier.MASTER}>Master</SelectItem>
          <SelectItem value={UserTier.DEAN}>Dean</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default FilterDropdown;
