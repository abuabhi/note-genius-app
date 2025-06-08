
import { NoteSearch } from '@/components/notes/NoteSearch';
import { FilterMenu } from '@/components/notes/FilterMenu';
import { NoteSorter } from '@/components/notes/NoteSorter';
import { ViewToggle } from './ViewToggle';
import { ViewMode, useViewPreferences } from '@/hooks/useViewPreferences';

interface OptimizedNotesFiltersProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  sortType: string;
  onSortChange: (type: string) => void;
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
  const { viewMode, setViewMode } = useViewPreferences('notes');

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1">
          <NoteSearch />
        </div>
        <ViewToggle viewMode={viewMode} onViewModeChange={setViewMode} />
      </div>
      
      {/* Filters */}
      <div className="flex items-center gap-2">
        <FilterMenu />
        <NoteSorter />
      </div>
    </div>
  );
};
