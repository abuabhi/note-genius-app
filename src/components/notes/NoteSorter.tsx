
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
        <SelectTrigger className="w-[180px] h-9 bg-white border-mint-200 focus:ring-mint-400">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="date-desc">Newest first</SelectItem>
          <SelectItem value="date-asc">Oldest first</SelectItem>
          <SelectItem value="title-asc">Title (A to Z)</SelectItem>
          <SelectItem value="title-desc">Title (Z to A)</SelectItem>
          <SelectItem value="category">By Subject</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
