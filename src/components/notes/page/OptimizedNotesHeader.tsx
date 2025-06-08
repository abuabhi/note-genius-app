
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, FileText, Scan, Upload } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface OptimizedNotesHeaderProps {
  totalCount: number;
  onCreateNote: () => void;
  isCreating: boolean;
}

export const OptimizedNotesHeader = ({ 
  totalCount, 
  onCreateNote, 
  isCreating 
}: OptimizedNotesHeaderProps) => {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-mint-100/50 shadow-lg">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-mint-100 rounded-lg">
              <FileText className="h-6 w-6 text-mint-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                My Notes
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="bg-mint-50 text-mint-700 border-mint-200">
                  {totalCount} {totalCount === 1 ? 'note' : 'notes'}
                </Badge>
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm text-gray-500">Live sync</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={onCreateNote}
              disabled={isCreating}
              className="bg-mint-600 hover:bg-mint-700 text-white gap-2"
            >
              <Plus className="h-4 w-4" />
              {isCreating ? 'Creating...' : 'New Note'}
            </Button>
            
            <Button variant="outline" className="gap-2" disabled>
              <Scan className="h-4 w-4" />
              Scan
            </Button>
            
            <Button variant="outline" className="gap-2" disabled>
              <Upload className="h-4 w-4" />
              Import
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
