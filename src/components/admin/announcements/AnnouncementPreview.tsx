
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Announcement } from './types';
import { Card } from '@/components/ui/card';
import { UnifiedContentRenderer } from '@/components/notes/study/enhancements/UnifiedContentRenderer';

interface AnnouncementPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
}

export const AnnouncementPreview = ({ open, onOpenChange, announcement }: AnnouncementPreviewProps) => {
  if (!announcement) return null;

  const getBackgroundColor = () => {
    return announcement?.background_color || '#14b8a6'; // Default to mint-600 if not specified
  };

  const getTextColor = () => {
    return announcement?.text_color || '#ffffff';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Announcement Preview</DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          <Card className="overflow-hidden border-none shadow-md">
            <div
              className="flex items-center justify-center px-4 py-5"
              style={{
                backgroundColor: getBackgroundColor(),
                color: getTextColor()
              }}
            >
              <div 
                className="w-full text-center flex items-center justify-center"
                style={{ 
                  textAlign: announcement?.text_align || 'center',
                }}
              >
                <UnifiedContentRenderer 
                  content={announcement.content} 
                  textAlign="center" 
                  className="text-white"
                  isMarkdown={true}
                />
              </div>
            </div>
          </Card>
          
          <div className="mt-4">
            <h3 className="text-sm font-medium mb-1">Preview Notes:</h3>
            <p className="text-muted-foreground text-sm">
              This is how the announcement will appear on the website. The actual appearance may vary slightly depending on screen size and device.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
