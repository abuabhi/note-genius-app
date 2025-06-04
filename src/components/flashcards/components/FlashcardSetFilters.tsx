
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserSubject } from "@/types/subject";

interface FlashcardSetFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  subjectFilter: string | undefined;
  setSubjectFilter: (subject: string | undefined) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  userSubjects: UserSubject[];
  subjectsLoading: boolean;
  filteredCount: number;
  totalCount: number;
  onClearFilters: () => void;
}

const FlashcardSetFilters = ({
  searchQuery,
  setSearchQuery,
  subjectFilter,
  setSubjectFilter,
  sortBy,
  setSortBy,
  userSubjects,
  subjectsLoading,
  filteredCount,
  totalCount,
  onClearFilters,
}: FlashcardSetFiltersProps) => {
  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search flashcard sets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Subject Filter */}
        <Select 
          value={subjectFilter || "all_subjects"} 
          onValueChange={(value) => {
            console.log('Subject filter changed to:', value);
            setSubjectFilter(value === "all_subjects" ? undefined : value);
          }}
          disabled={subjectsLoading}
        >
          <SelectTrigger className="w-48">
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
        
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Recently Updated</SelectItem>
            <SelectItem value="created_at">Recently Created</SelectItem>
            <SelectItem value="name">Name</SelectItem>
            <SelectItem value="card_count">Card Count</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          {filteredCount} of {totalCount} sets
          {subjectFilter && ` in ${subjectFilter}`}
        </p>
        {(searchQuery || subjectFilter) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500"
          >
            Clear filters
          </Button>
        )}
      </div>
    </div>
  );
};

export default FlashcardSetFilters;
