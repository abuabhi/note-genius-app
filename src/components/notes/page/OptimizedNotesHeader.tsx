
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';

interface OptimizedNotesHeaderProps {
  totalCount: number;
  onCreateNote: () => void;
  onOpenImportDialog: () => void;
  isCreating: boolean;
}

export const OptimizedNotesHeader = ({ 
  totalCount, 
  onCreateNote, 
  onOpenImportDialog, 
  isCreating 
}: OptimizedNotesHeaderProps) => {
  const { searchTerm, selectedSubject } = useOptimizedNotes();

  // Show count with context
  const getCountText = () => {
    if (searchTerm || selectedSubject !== 'all') {
      return `${totalCount} filtered notes`;
    }
    return `${totalCount} notes`;
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {getCountText()}
          </p>
        </div>
      </div>
    </div>
  );
};
