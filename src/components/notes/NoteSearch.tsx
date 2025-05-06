
import { useNotes } from "@/contexts/NoteContext";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { NoteSorter } from "./NoteSorter";

export const NoteSearch = () => {
  const { searchTerm, setSearchTerm, notes, filteredNotes } = useNotes();
  
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search notes..."
          className="pl-9 w-full"
        />
        {searchTerm.trim() && (
          <div className="text-xs text-muted-foreground mt-1">
            Found {filteredNotes.length} of {notes.length} notes
          </div>
        )}
      </div>
      <NoteSorter />
    </div>
  );
};
