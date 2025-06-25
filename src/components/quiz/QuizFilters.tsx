
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

interface Grade {
  id: string;
  name: string;
}

interface QuizFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    subject?: string;
    grade?: string;
  }) => void;
  subjects: Subject[];
  grades: Grade[];
  isLoading?: boolean;
  totalQuizzes: number;
}

export const QuizFilters: React.FC<QuizFiltersProps> = ({
  onFiltersChange,
  subjects,
  grades,
  isLoading = false,
  totalQuizzes
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({
      search: value || undefined,
      subject: selectedSubject || undefined,
      grade: selectedGrade || undefined,
    });
  };

  const handleSubjectChange = (value: string) => {
    const newSubject = value === 'all' ? '' : value;
    setSelectedSubject(newSubject);
    onFiltersChange({
      search: search || undefined,
      subject: newSubject || undefined,
      grade: selectedGrade || undefined,
    });
  };

  const handleGradeChange = (value: string) => {
    const newGrade = value === 'all' ? '' : value;
    setSelectedGrade(newGrade);
    onFiltersChange({
      search: search || undefined,
      subject: selectedSubject || undefined,
      grade: newGrade || undefined,
    });
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedSubject('');
    setSelectedGrade('');
    onFiltersChange({});
  };

  const hasActiveFilters = search || selectedSubject || selectedGrade;
  const activeFiltersCount = [search, selectedSubject, selectedGrade].filter(Boolean).length;

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
        
        <Select value={selectedSubject || 'all'} onValueChange={handleSubjectChange} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-48 border-mint-200">
            <SelectValue placeholder="All Subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={selectedGrade || 'all'} onValueChange={handleGradeChange} disabled={isLoading}>
          <SelectTrigger className="w-full sm:w-48 border-mint-200">
            <SelectValue placeholder="All Grades" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Grades</SelectItem>
            {grades.map((grade) => (
              <SelectItem key={grade.id} value={grade.id}>
                {grade.name}
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
                onClick={() => handleSubjectChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          
          {selectedGrade && (
            <Badge variant="secondary" className="bg-purple-100 text-purple-800">
              {grades.find(g => g.id === selectedGrade)?.name}
              <Button
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0 ml-1 hover:bg-purple-200"
                onClick={() => handleGradeChange('all')}
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
