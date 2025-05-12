
import React from "react";
import { FilterMenu } from "@/components/notes/FilterMenu";
import { NoteSorter } from "@/components/notes/NoteSorter";

export const NotesHeaderBottom = () => {
  return (
    <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
      <div className="flex flex-wrap gap-2">
        <FilterMenu />
        <NoteSorter />
      </div>
    </div>
  );
};
