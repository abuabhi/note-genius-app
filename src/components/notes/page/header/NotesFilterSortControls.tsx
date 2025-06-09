
import React from "react";
import { Button } from "@/components/ui/button";
import { Filter, SortAsc } from "lucide-react";

export const NotesFilterSortControls = () => {
  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" className="border-mint-200 text-mint-700 hover:bg-mint-50">
        <Filter className="mr-2 h-4 w-4" />
        Filter
      </Button>
      <Button variant="outline" size="sm" className="border-mint-200 text-mint-700 hover:bg-mint-50">
        <SortAsc className="mr-2 h-4 w-4" />
        Sort
      </Button>
    </div>
  );
};
