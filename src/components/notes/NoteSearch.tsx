
import { useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useNotes } from '@/contexts/NoteContext';

export const NoteSearch = () => {
  const { searchTerm, setSearchTerm } = useNotes();
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm);

  useEffect(() => {
    setLocalSearchTerm(searchTerm);
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchTerm(e.target.value);
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setLocalSearchTerm('');
    setSearchTerm('');
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-purple-400" />
      <Input
        type="text"
        value={localSearchTerm}
        onChange={handleSearchChange}
        placeholder="Search notes..."
        className="pl-10 pr-10 border-purple-200 focus-visible:ring-purple-400"
      />
      {localSearchTerm && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
          onClick={clearSearch}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
