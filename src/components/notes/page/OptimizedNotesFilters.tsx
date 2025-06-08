
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Filter } from 'lucide-react';

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
  return (
    <Card className="bg-white/60 backdrop-blur-sm border-mint-100/50">
      <CardContent className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search notes..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-white/80"
            />
          </div>

          {/* Subject Filter */}
          <Select value={selectedSubject} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-full lg:w-[200px] bg-white/80">
              <SelectValue placeholder="Select subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Subjects</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="work">Work</SelectItem>
              <SelectItem value="personal">Personal</SelectItem>
            </SelectContent>
          </Select>

          {/* Sort */}
          <Select value={sortType} onValueChange={onSortChange}>
            <SelectTrigger className="w-full lg:w-[180px] bg-white/80">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
            </SelectContent>
          </Select>

          {/* Show Archived */}
          <div className="flex items-center space-x-2">
            <Switch
              id="show-archived"
              checked={showArchived}
              onCheckedChange={onShowArchivedChange}
            />
            <Label htmlFor="show-archived" className="text-sm text-gray-600">
              Show archived
            </Label>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
