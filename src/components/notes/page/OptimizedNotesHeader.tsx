

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText, Import, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OptimizedNotesHeaderProps {
  totalCount: number;
  onCreateNote: () => void;
  onOpenScanDialog: () => void;
  onOpenImportDialog: () => void;
  isCreating: boolean;
}

export const OptimizedNotesHeader = ({ 
  totalCount, 
  onCreateNote,
  onOpenScanDialog,
  onOpenImportDialog,
  isCreating 
}: OptimizedNotesHeaderProps) => {
  return (
    <CardContent className="p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 bg-gradient-to-br from-mint-500 to-mint-600 rounded-xl shadow-lg">
              <FileText className="h-7 w-7 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-sm" />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              My Notes
            </h1>
            <div className="flex items-center gap-3">
              <Badge 
                variant="secondary" 
                className="bg-mint-50 text-mint-700 border-mint-200 px-3 py-1.5 font-medium text-sm"
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                {totalCount} {totalCount === 1 ? 'note' : 'notes'}
              </Badge>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-500 font-medium">Live sync active</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            className="bg-mint-600 hover:bg-mint-700 text-white shadow-sm hover:shadow-md transition-all duration-200 font-medium border-0"
            onClick={onCreateNote}
            disabled={isCreating}
          >
            <Plus className="mr-2 h-4 w-4" />
            Manually
          </Button>
          
          <Button 
            variant="outline"
            className="shadow-sm hover:shadow-md transition-all duration-200 font-medium"
            onClick={onOpenImportDialog}
            disabled={isCreating}
          >
            <Import className="mr-2 h-4 w-4" />
            Import
          </Button>
        </div>
      </div>
    </CardContent>
  );
};

