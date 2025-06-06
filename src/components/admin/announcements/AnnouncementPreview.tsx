
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Smartphone, Monitor } from 'lucide-react';

interface AnnouncementPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: any;
}

export const AnnouncementPreview = ({ 
  open, 
  onOpenChange, 
  announcement 
}: AnnouncementPreviewProps) => {
  if (!announcement) return null;

  const PreviewBar = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div
      className={`w-full rounded-lg overflow-hidden ${isMobile ? 'max-w-sm' : 'max-w-full'}`}
      style={{
        backgroundColor: announcement.background_color,
        color: announcement.text_color
      }}
    >
      <div className={`px-4 py-3 ${isMobile ? 'text-sm' : 'text-base'}`}>
        <div className={`flex items-center justify-between gap-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
            <div className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
              {announcement.title}
            </div>
            <div className={`mt-1 ${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>
              {isMobile && announcement.compact_text ? announcement.compact_text : announcement.content}
            </div>
          </div>

          <div className={`flex items-center gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
            {announcement.cta_text && announcement.cta_url && (
              <Button
                size={isMobile ? "sm" : "default"}
                variant="secondary"
                className={`${isMobile ? 'flex-1 text-xs' : ''} bg-white/20 hover:bg-white/30 text-current border-white/30`}
              >
                {announcement.cta_text}
              </Button>
            )}

            {announcement.dismissible && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                className={`${isMobile ? 'min-w-[44px] h-[44px] p-0' : 'p-2'} text-current hover:bg-white/20`}
              >
                <X className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
              </Button>
            )}
          </div>
        </div>

        {isMobile && (
          <div className="mt-2 text-xs opacity-60 text-center">
            Swipe left or right to dismiss
          </div>
        )}
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Announcement Preview</DialogTitle>
          <DialogDescription>
            See how your announcement will appear to users on different devices
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Desktop Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <h3 className="font-medium">Desktop View</h3>
              <Badge variant="outline">Full Layout</Badge>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50">
              <PreviewBar isMobile={false} />
            </div>
          </div>

          {/* Mobile Preview */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <h3 className="font-medium">Mobile View</h3>
              <Badge variant="outline">{announcement.mobile_layout}</Badge>
            </div>
            <div className="border rounded-lg p-4 bg-gray-50 flex justify-center">
              <PreviewBar isMobile={true} />
            </div>
          </div>

          {/* Announcement Details */}
          <div className="border-t pt-4">
            <h3 className="font-medium mb-3">Configuration Details</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Target Tier:</span>
                <p className="text-muted-foreground">{announcement.target_tier}</p>
              </div>
              <div>
                <span className="font-medium">Target Pages:</span>
                <p className="text-muted-foreground">
                  {Array.isArray(announcement.target_pages) 
                    ? announcement.target_pages.join(', ') 
                    : announcement.target_pages}
                </p>
              </div>
              <div>
                <span className="font-medium">Priority:</span>
                <p className="text-muted-foreground">{announcement.priority}</p>
              </div>
              <div>
                <span className="font-medium">Mobile Layout:</span>
                <p className="text-muted-foreground">{announcement.mobile_layout}</p>
              </div>
              <div>
                <span className="font-medium">Dismissible:</span>
                <p className="text-muted-foreground">{announcement.dismissible ? 'Yes' : 'No'}</p>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <p className="text-muted-foreground">{announcement.is_active ? 'Active' : 'Inactive'}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
