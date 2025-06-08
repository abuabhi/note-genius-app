
import { FilterMenu } from '@/components/notes/FilterMenu';
import { NoteSorter } from '@/components/notes/NoteSorter';
import { ViewToggle } from './ViewToggle';
import { ViewMode, useViewPreferences } from '@/hooks/useViewPreferences';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

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
  const optimizedNotesContext = useOptimizedNotes();

  return (
    <div className="space-y-4">
      {/* Search and View Toggle */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Search notes..."
            value={optimizedNotesContext.searchTerm}
            onChange={(e) => optimizedNotesContext.setSearchTerm(e.target.value)}
            className="pl-10 bg-white/80 backdrop-blur-sm border-mint-200 focus:border-mint-400 transition-colors"
          />
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
