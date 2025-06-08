
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';
import { useUserSubjects } from '@/hooks/useUserSubjects';

interface OptimizedNotesFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortType: string;
  onSortChange: (sort: string) => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
  selectedSubject: string;
  onSubjectChange: (subject: string) => void;
}

// Default subjects that should always be available
const DEFAULT_SUBJECTS = [
  'Arts',
  'English',
  'Languages', 
  'Mathematics',
  'Science',
  'Technologies'
];

export const OptimizedNotesFilters = ({
  searchTerm,
  onSearchChange,
  sortType,
  onSortChange,
  showArchived,
  onShowArchivedChange,
  selectedSubject,
  onSubjectChange
}: OptimizedNotesFiltersProps) => {
  const { subjects: userSubjects, isLoading } = useUserSubjects();

  // Combine default subjects with user subjects, avoiding duplicates (case-insensitive)
  const allSubjects = [
    ...DEFAULT_SUBJECTS,
    ...(userSubjects || [])
      .map(s => s.name)
      .filter(name => !DEFAULT_SUBJECTS.some(defaultSubject => 
        defaultSubject.toLowerCase() === name.toLowerCase()
      ))
  ];

  // Remove duplicates and sort
  const uniqueSubjects = [...new Set(allSubjects)].sort();

  return (
    <Card className="bg-white/60 backdrop-blur-sm border-mint-100/50">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/80 border-mint-200 focus:ring-mint-400"
            />
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <Select value={selectedSubject} onValueChange={onSubjectChange}>
              <SelectTrigger className="w-40 bg-white/80 border-mint-200">
                <SelectValue placeholder="All Subjects" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map(subject => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort */}
          <Select value={sortType} onValueChange={onSortChange}>
            <SelectTrigger className="w-32 bg-white/80 border-mint-200">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="alphabetical">A-Z</SelectItem>
            </SelectContent>
          </Select>

          {/* Show Archived Toggle */}
          <div className="flex items-center space-x-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={onShowArchivedChange}
            />
            <Label htmlFor="show-archived" className="text-sm">
              Show Archived
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
