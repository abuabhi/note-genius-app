
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotes } from "@/contexts/NoteContext";
import { SortType } from "@/contexts/notes/types";

export const NoteSorter = () => {
  const { 
    sortType, 
    setSortType
  } = useNotes();

  const handleSortChange = (value: string) => {
    setSortType(value as SortType);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select
        value={sortType}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-[180px] h-9 bg-white border-mint-200 focus:ring-mint-400 shadow-sm hover:shadow-md transition-all duration-200 font-medium">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent className="bg-white border border-mint-100 shadow-lg rounded-lg">
          <SelectItem value="date-desc" className="cursor-pointer hover:bg-mint-50 transition-colors duration-150">
            Newest first
          </SelectItem>
          <SelectItem value="date-asc" className="cursor-pointer hover:bg-mint-50 transition-colors duration-150">
            Oldest first
          </SelectItem>
          <SelectItem value="title-asc" className="cursor-pointer hover:bg-mint-50 transition-colors duration-150">
            Title (A to Z)
          </SelectItem>
          <SelectItem value="title-desc" className="cursor-pointer hover:bg-mint-50 transition-colors duration-150">
            Title (Z to A)
          </SelectItem>
          <SelectItem value="category" className="cursor-pointer hover:bg-mint-50 transition-colors duration-150">
            By Subject
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
