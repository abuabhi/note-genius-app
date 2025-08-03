import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, FileText, ScanLine, Eye } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface PostSaveSuccessDialogProps {
  isOpen: boolean;
  onClose: () => void;
  savedCount: number;
  saveMode: 'separate' | 'merged';
  onScanMore: () => void;
  onViewNotes: () => void;
}

export const PostSaveSuccessDialog = ({
  isOpen,
  onClose,
  savedCount,
  saveMode,
  onScanMore,
  onViewNotes
}: PostSaveSuccessDialogProps) => {
  const getSuccessMessage = () => {
    if (saveMode === 'separate') {
      return `${savedCount} separate notes created successfully`;
    } else {
      return `1 merged note created from ${savedCount} scans`;
    }
  };

  const handleViewNotes = () => {
    onViewNotes();
    onClose();
  };

  const handleScanMore = () => {
    onScanMore();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <DialogTitle className="text-xl">Success!</DialogTitle>
          <DialogDescription className="text-base">
            {getSuccessMessage()}
          </DialogDescription>
        </DialogHeader>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-4">
            <div className="flex items-center justify-center gap-4 text-sm text-green-700">
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{saveMode === 'separate' ? `${savedCount} Notes` : '1 Note'}</span>
              </div>
              <div className="flex items-center gap-1">
                <ScanLine className="w-4 h-4" />
                <span>{savedCount} Scans</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-3 pt-2">
          <Button
            onClick={handleViewNotes}
            className="w-full"
          >
            <Eye className="mr-2 h-4 w-4" />
            View My Notes
          </Button>
          
          <Button
            onClick={handleScanMore}
            variant="outline"
            className="w-full"
          >
            <ScanLine className="mr-2 h-4 w-4" />
            Scan More Documents
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};