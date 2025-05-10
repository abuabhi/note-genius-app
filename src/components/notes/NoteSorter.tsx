
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
import { Button } from '@/components/ui/button';
import { Archive, ArchiveX } from 'lucide-react';

export const NoteSorter = () => {
  const { 
    sortType, 
    setSortType, 
    showArchived, 
    setShowArchived 
  } = useNotes();

  const handleSortChange = (value: string) => {
    setSortType(value as SortType);
  };

  const toggleArchived = () => {
    setShowArchived(!showArchived);
  };

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Select
        value={sortType}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-[180px] h-9 bg-white border-purple-200 focus:ring-purple-400">
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

      <Button 
        variant={showArchived ? "default" : "outline"} 
        size="sm" 
        onClick={toggleArchived}
        className={showArchived ? 
          "bg-purple-600 hover:bg-purple-700" : 
          "border-purple-200 hover:bg-purple-50 hover:text-purple-700"}
      >
        {showArchived ? (
          <>
            <ArchiveX className="h-4 w-4 mr-2" />
            Hide Archived
          </>
        ) : (
          <>
            <Archive className="h-4 w-4 mr-2" />
            Show Archived
          </>
        )}
      </Button>
    </div>
  );
};
