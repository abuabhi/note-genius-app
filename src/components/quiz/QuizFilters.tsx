
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface QuizFiltersProps {
  onFiltersChange: (filters: {
    search?: string;
    subject?: string;
    grade?: string;
    section?: string;
    userOnly?: boolean;
  }) => void;
  subjects: Array<{ id: string; name: string }>;
  grades: Array<{ id: string; name: string }>;
  sections: Array<{ id: string; name: string }>;
  isLoading?: boolean;
  totalQuizzes?: number;
}

export const QuizFilters: React.FC<QuizFiltersProps> = ({
  onFiltersChange,
  subjects,
  grades,
  sections,
  isLoading = false,
  totalQuizzes = 0
}) => {
  const [search, setSearch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [selectedSection, setSelectedSection] = useState<string>('all');
  const [userOnly, setUserOnly] = useState(false);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      onFiltersChange({
        search: search.trim() || undefined,
        subject: selectedSubject === 'all' ? undefined : selectedSubject,
        grade: selectedGrade === 'all' ? undefined : selectedGrade,
        section: selectedSection === 'all' ? undefined : selectedSection,
        userOnly: userOnly || undefined,
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [search, selectedSubject, selectedGrade, selectedSection, userOnly, onFiltersChange]);

  const clearAllFilters = () => {
    setSearch('');
    setSelectedSubject('all');
    setSelectedGrade('all');
    setSelectedSection('all');
    setUserOnly(false);
  };

  const hasActiveFilters = 
    search.trim() !== '' || 
    selectedSubject !== 'all' || 
    selectedGrade !== 'all' || 
    selectedSection !== 'all' || 
    userOnly;

  const getActiveFilterCount = () => {
    let count = 0;
    if (search.trim()) count++;
    if (selectedSubject !== 'all') count++;
    if (selectedGrade !== 'all') count++;
    if (selectedSection !== 'all') count++;
    if (userOnly) count++;
    return count;
  };

  return (
    <Card className="border-mint-200 bg-white/90 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-mint-800 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Quiz Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="bg-mint-100 text-mint-700">
                {getActiveFilterCount()} active
              </Badge>
            )}
          </CardTitle>
          {hasActiveFilters && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearAllFilters}
              className="text-mint-600 hover:text-mint-700 hover:bg-mint-50"
            >
              <X className="h-4 w-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search quizzes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 border-mint-200 focus:border-mint-400 focus:ring-mint-400"
            disabled={isLoading}
          />
        </div>

        {/* My Quizzes Only */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="userOnly"
            checked={userOnly}
            onCheckedChange={(checked) => setUserOnly(checked as boolean)}
            disabled={isLoading}
          />
          <Label htmlFor="userOnly" className="text-sm font-medium text-gray-700">
            Show only my quizzes
          </Label>
        </div>

        {/* Advanced Filters */}
        <Collapsible open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-between p-0 h-auto text-mint-600 hover:text-mint-700"
            >
              <span className="font-medium">Advanced Filters</span>
              {isAdvancedOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
          
          <CollapsibleContent className="space-y-4 mt-4">
            {/* Subject Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Subject</Label>
              <Select
                value={selectedSubject}
                onValueChange={setSelectedSubject}
                disabled={isLoading}
              >
                <SelectTrigger className="border-mint-200 focus:border-mint-400">
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
            </div>

            {/* Grade Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Grade</Label>
              <Select
                value={selectedGrade}
                onValueChange={setSelectedGrade}
                disabled={isLoading}
              >
                <SelectTrigger className="border-mint-200 focus:border-mint-400">
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

            {/* Section Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">Section</Label>
              <Select
                value={selectedSection}
                onValueChange={setSelectedSection}
                disabled={isLoading}
              >
                <SelectTrigger className="border-mint-200 focus:border-mint-400">
                  <SelectValue placeholder="All Sections" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sections</SelectItem>
                  {sections.map((section) => (
                    <SelectItem key={section.id} value={section.id}>
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-mint-100">
            {search.trim() && (
              <Badge variant="outline" className="bg-mint-50 text-mint-700 border-mint-200">
                Search: "{search.trim()}"
                <button
                  onClick={() => setSearch('')}
                  className="ml-1 hover:text-mint-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedSubject !== 'all' && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                Subject: {subjects.find(s => s.id === selectedSubject)?.name}
                <button
                  onClick={() => setSelectedSubject('all')}
                  className="ml-1 hover:text-blue-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedGrade !== 'all' && (
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                Grade: {grades.find(g => g.id === selectedGrade)?.name}
                <button
                  onClick={() => setSelectedGrade('all')}
                  className="ml-1 hover:text-purple-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {selectedSection !== 'all' && (
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                Section: {sections.find(s => s.id === selectedSection)?.name}
                <button
                  onClick={() => setSelectedSection('all')}
                  className="ml-1 hover:text-orange-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {userOnly && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                My Quizzes Only
                <button
                  onClick={() => setUserOnly(false)}
                  className="ml-1 hover:text-green-900"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
