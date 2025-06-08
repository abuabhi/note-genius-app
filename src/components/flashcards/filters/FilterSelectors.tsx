
import { Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { UserSubject } from '@/types/subject';

interface FilterSelectorsProps {
  subjectFilter?: string;
  timeFilter: string;
  sortBy: string;
  viewMode: string;
  userSubjects: UserSubject[];
  subjectsLoading: boolean;
  onSubjectChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onViewModeChange: (value: string) => void;
}

const timeFilterLabels = {
  all: 'All time',
  week: 'Last 7 days',
  month: 'Last 30 days',
  quarter: 'Last 90 days',
};

export const FilterSelectors = ({
  subjectFilter,
  timeFilter,
  sortBy,
  viewMode,
  userSubjects,
  subjectsLoading,
  onSubjectChange,
  onTimeChange,
  onSortChange,
  onViewModeChange,
}: FilterSelectorsProps) => {
  return (
    <>
      {/* Subject Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <Select
          value={subjectFilter || "all_subjects"}
          onValueChange={(value) => onSubjectChange(value === "all_subjects" ? undefined : value)}
          disabled={subjectsLoading}
        >
          <SelectTrigger className="border-mint-200">
            <SelectValue placeholder="All subjects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all_subjects">All subjects</SelectItem>
            {userSubjects.map(subject => (
              <SelectItem key={subject.id} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Time Filter */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Time Period</label>
        <Select value={timeFilter} onValueChange={onTimeChange}>
          <SelectTrigger className="border-mint-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(timeFilterLabels).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3" />
                  {label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Sort By */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Sort by</label>
        <Select value={sortBy} onValueChange={onSortChange}>
          <SelectTrigger className="border-mint-200">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Recently Updated</SelectItem>
            <SelectItem value="created_at">Recently Created</SelectItem>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="card_count">Card Count</SelectItem>
            <SelectItem value="progress">Progress</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* View Mode */}
      <div className="space-y-2">
        <label className="text-sm font-medium">View</label>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('list')}
            className="flex-1"
          >
            List
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onViewModeChange('grid')}
            className="flex-1"
          >
            Grid
          </Button>
        </div>
      </div>
    </>
  );
};
