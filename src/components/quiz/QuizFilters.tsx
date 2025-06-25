
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QuizFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    subject?: string;
    grade?: string;
    section?: string;
    userOnly?: boolean;
  }) => void;
  subjects?: Array<{ id: string; name: string }>;
  grades?: Array<{ id: string; name: string }>;
  sections?: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  totalQuizzes?: number;
}

export const QuizFilters = ({
  onFiltersChange,
  subjects = [],
  grades = [],
  sections = [],
  isLoading = false,
  totalQuizzes = 0
}: QuizFiltersProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [userOnly, setUserOnly] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      handleFiltersChange({
        search: searchTerm,
        subject: selectedSubject,
        grade: selectedGrade,
        section: selectedSection,
        userOnly
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, selectedSubject, selectedGrade, selectedSection, userOnly]);

  const handleFiltersChange = (filters: any) => {
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedSubject('');
    setSelectedGrade('');
    setSelectedSection('');
    setUserOnly(false);
    onFiltersChange({});
  };

  const activeFiltersCount = [
    searchTerm,
    selectedSubject,
    selectedGrade,
    selectedSection,
    userOnly
  ].filter(Boolean).length;

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="space-y-4">
          {/* Search Bar - Always Visible */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search quizzes by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4"
              disabled={isLoading}
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex items-center justify-between">
            <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
              <CollapsibleTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Advanced Filters
                  {activeFiltersCount > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {activeFiltersCount}
                    </Badge>
                  )}
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Subject Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Subject
                    </label>
                    <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="All subjects" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-md z-50">
                        <SelectItem value="">All subjects</SelectItem>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.id}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Grade Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Grade
                    </label>
                    <Select value={selectedGrade} onValueChange={setSelectedGrade} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="All grades" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-md z-50">
                        <SelectItem value="">All grades</SelectItem>
                        {grades.map((grade) => (
                          <SelectItem key={grade.id} value={grade.id}>
                            {grade.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Section Filter */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                      Section
                    </label>
                    <Select value={selectedSection} onValueChange={setSelectedSection} disabled={isLoading}>
                      <SelectTrigger>
                        <SelectValue placeholder="All sections" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border shadow-md z-50">
                        <SelectItem value="">All sections</SelectItem>
                        {sections.map((section) => (
                          <SelectItem key={section.id} value={section.id}>
                            {section.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* User Only Filter */}
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="userOnly"
                      checked={userOnly}
                      onChange={(e) => setUserOnly(e.target.checked)}
                      className="rounded border-gray-300"
                      disabled={isLoading}
                    />
                    <label htmlFor="userOnly" className="text-sm font-medium text-gray-700">
                      My quizzes only
                    </label>
                  </div>
                </div>

                {/* Clear Filters */}
                {activeFiltersCount > 0 && (
                  <div className="mt-4 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearFilters}
                      className="flex items-center gap-2"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4" />
                      Clear Filters
                    </Button>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>

            {/* Results Count */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Loading...
                </div>
              ) : (
                <span>{totalQuizzes} quiz{totalQuizzes !== 1 ? 'es' : ''} found</span>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Search: "{searchTerm}"
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSearchTerm('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedSubject && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Subject: {subjects.find(s => s.id === selectedSubject)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSelectedSubject('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedGrade && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Grade: {grades.find(g => g.id === selectedGrade)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSelectedGrade('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {selectedSection && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  Section: {sections.find(s => s.id === selectedSection)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setSelectedSection('')}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              {userOnly && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  My quizzes only
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0 hover:bg-transparent"
                    onClick={() => setUserOnly(false)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
