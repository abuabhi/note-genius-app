import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Archive, Filter } from 'lucide-react';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

interface SubjectTabsProps {
  onSubjectChange: (subject: string) => void;
  activeSubject: string;
}

export const SubjectTabs: React.FC<SubjectTabsProps> = ({ onSubjectChange, activeSubject }) => {
  const {
    notes,
    showArchived,
    setShowArchived
  } = useOptimizedNotes();

  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const availableSubjects = useMemo(() => {
    const subjectSet = new Set<string>();
    notes.forEach(note => {
      if (note.subject && note.subject !== 'Uncategorized' && note.subject.trim() !== '') {
        subjectSet.add(note.subject);
      }
    });
    return Array.from(subjectSet).sort();
  }, [notes]);

  return (
    <div className="flex items-center justify-between">
      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2">
          <Button
            variant={activeSubject === 'all' ? 'default' : 'outline'}
            onClick={() => onSubjectChange('all')}
            size="sm"
          >
            All Subjects
          </Button>
          {availableSubjects.map((subject) => (
            <Button
              key={subject}
              variant={activeSubject === subject ? 'default' : 'outline'}
              onClick={() => onSubjectChange(subject)}
              size="sm"
            >
              {subject}
            </Button>
          ))}
        </div>
      </ScrollArea>

      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsFilterOpen(!isFilterOpen)}
        className="ml-2"
      >
        <Filter className="h-4 w-4 mr-2" />
        Filters
      </Button>

      {isFilterOpen && (
        <div className="absolute right-0 mt-10 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            <label className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900" role="menuitem">
              <input
                type="checkbox"
                className="mr-2"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
              {showArchived ? (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Hide Archived
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 mr-2" />
                  Show Archived
                </>
              )}
            </label>
          </div>
        </div>
      )}
    </div>
  );
};

