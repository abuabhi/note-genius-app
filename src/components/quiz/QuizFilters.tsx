
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
import { Search, X } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
}

interface QuizFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    subject?: string;
  }) => void;
  subjects: Subject[];
  isLoading?: boolean;
  totalQuizzes: number;
}

export const QuizFilters: React.FC<QuizFiltersProps> = ({
  onFiltersChange,
  subjects,
  isLoading = false,
  totalQuizzes
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({
      search: value || undefined,
      subject: selectedSubject || undefined,
    });
  };

  const handleSubjectChange = (value: string) => {
    const newSubject = value === 'none' ? '' : value;
    setSelectedSubject(newSubject);
    onFiltersChange({
      search: search || undefined,
      subject: newSubject || undefined,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSubject('');
    onFiltersChange({});
  };

  const hasActiveFilters = search || selectedSubject;
  const activeFiltersCount = [search, selectedSubject].filter(Boolean).length;

  return (
    <div className="space-y-4">
      {/* Single Filter Row */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 border-mint-200 focus:border-mint-500"
            disabled={isLoading}
          />
        </div>
        
        <Select value={selectedSubject || 'none'} onValueChange={handleSubjectChange} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-48 border-mint-200">
            <SelectValue placeholder="Filter by Subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Active Filters Display */}
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
          
          {selectedSubject && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {subjects.find(s => s.id === selectedSubject)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                onClick={() => handleSubjectChange('none')}
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
  );
};
