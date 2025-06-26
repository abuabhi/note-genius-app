
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Search, X } from 'lucide-react';
import { useUserSubjects } from '@/hooks/useUserSubjects';

interface NotesFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    subject?: string;
    showArchived?: boolean;
  }) => void;
  totalNotes: number;
  searchTerm: string;
  selectedSubject: string;
  showArchived: boolean;
  sortType: string;
  onSortChange: (sort: string) => void;
}

export const NotesFilters: React.FC<NotesFiltersProps> = ({
  onFiltersChange,
  totalNotes,
  searchTerm: initialSearchTerm,
  selectedSubject,
  showArchived,
  sortType,
  onSortChange
}) => {
  const [search, setSearch] = useState(initialSearchTerm);
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({
      search: value || undefined,
      subject: selectedSubject !== 'all' ? selectedSubject : undefined,
      showArchived,
    });
  };

  const handleSubjectChange = (value: string) => {
    const newSubject = value === 'all' ? 'all' : value;
    onFiltersChange({
      search: search || undefined,
      subject: newSubject !== 'all' ? newSubject : undefined,
      showArchived,
    });
  };

  const handleArchivedToggle = (checked: boolean) => {
    onFiltersChange({
      search: search || undefined,
      subject: selectedSubject !== 'all' ? selectedSubject : undefined,
      showArchived: checked,
    });
  };

  const clearFilters = () => {
    setSearch('');
    onFiltersChange({});
  };

  const hasActiveFilters = search || selectedSubject !== 'all' || showArchived;
  const activeFiltersCount = [search, selectedSubject !== 'all' ? selectedSubject : null, showArchived ? 'archived' : null].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Single Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search notes..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-mint-200 focus:border-mint-500"
            disabled={subjectsLoading}
          />
        </div>
        
        <Select value={selectedSubject} onValueChange={handleSubjectChange} disabled={subjectsLoading}>
          <SelectTrigger className="w-full sm:w-48 border-mint-200">
            <SelectValue placeholder="Filter by Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortType} onValueChange={onSortChange}>
          <SelectTrigger className="w-full sm:w-48 border-mint-200">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
            <SelectItem value="alphabetical">Alphabetical</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center space-x-2">
          <Switch
            id="show-archived"
            checked={showArchived}
            onCheckedChange={handleArchivedToggle}
          />
          <Label htmlFor="show-archived" className="text-sm font-medium">
            Show Archived
          </Label>
        </div>
      </div>

      {/* Results Counter and Active Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-sm text-gray-600 font-medium">
          {totalNotes} note{totalNotes === 1 ? '' : 's'}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-600">Filters ({activeFiltersCount}):</span>
            
            {search && (
              <Badge variant="secondary" className="bg-mint-100 text-mint-800">
                "{search}"
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-mint-200"
                  onClick={() => handleSearchChange('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            {selectedSubject !== 'all' && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedSubject}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                  onClick={() => handleSubjectChange('all')}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}

            {showArchived && (
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Archived
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1 hover:bg-gray-200"
                  onClick={() => handleArchivedToggle(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-gray-500 hover:text-gray-700"
            >
              Clear all
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
