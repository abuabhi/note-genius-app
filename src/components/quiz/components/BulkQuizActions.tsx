
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  Copy, 
  Share, 
  X,
  CheckSquare 
} from 'lucide-react';
import { UnifiedBulkDeleteDialog } from '@/components/ui/unified/UnifiedBulkDeleteDialog';
import { toast } from '@/hooks/use-toast';

interface BulkQuizActionsProps {
  selectedQuizIds: Set<string>;
  totalQuizzes: number;
  onClearSelection: () => void;
  onSelectAll: () => void;
  onBulkDelete: (quizIds: string[]) => void;
  onRefresh: () => void;
}

export const BulkQuizActions: React.FC<BulkQuizActionsProps> = ({
  selectedQuizIds,
  totalQuizzes,
  onClearSelection,
  onSelectAll,
  onBulkDelete,
  onRefresh
}) => {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const selectedCount = selectedQuizIds.size;

  if (selectedCount === 0) return null;

  const handleBulkDelete = async () => {
    await onBulkDelete(Array.from(selectedQuizIds));
    onClearSelection();
    onRefresh();
  };

  const handleDuplicate = () => {
    // TODO: Implement bulk duplication
    toast({
      title: "Feature coming soon",
      description: "Bulk duplication will be available soon.",
    });
  };

  const handleShare = () => {
    // TODO: Implement bulk sharing
    toast({
      title: "Feature coming soon",
      description: "Bulk sharing will be available soon.",
    });
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-white border border-mint-200 rounded-lg shadow-lg p-4 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-mint-700">
              {selectedCount} selected
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={selectedCount === totalQuizzes ? onClearSelection : onSelectAll}
              className="text-mint-600 hover:text-mint-700"
            >
              <CheckSquare className="h-4 w-4 mr-1" />
              {selectedCount === totalQuizzes ? 'Deselect All' : 'Select All'}
            </Button>
          </div>

          <div className="h-4 w-px bg-gray-300" />

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDuplicate}
              className="border-mint-200 text-mint-700 hover:bg-mint-50"
            >
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="border-mint-200 text-mint-700 hover:bg-mint-50"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="border-red-200 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClearSelection}
            className="ml-2 hover:bg-gray-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <UnifiedBulkDeleteDialog
        isOpen={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        onConfirm={handleBulkDelete}
        itemCount={selectedCount}
        itemType="quiz"
      />
    </>
  );
};
