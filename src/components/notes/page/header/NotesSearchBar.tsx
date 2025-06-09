
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export const NotesSearchBar = () => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search notes..."
        className="pl-10 bg-white/80 border-mint-200 focus:border-mint-400 focus:ring-mint-400"
      />
    </div>
  );
};
