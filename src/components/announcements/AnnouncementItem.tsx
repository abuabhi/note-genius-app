
import React from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface Announcement {
  id: string;
  title: string;
  content: string;
  compact_text?: string;
  cta_text?: string;
  cta_url?: string;
  background_color: string;
  text_color: string;
  mobile_layout: string;
  priority: number;
  dismissible: boolean;
  text_align?: string;
}

interface AnnouncementItemProps {
  announcement: Announcement;
  isMobile: boolean;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onDismiss: () => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onTouchMove?: (e: React.TouchEvent) => void;
  onTouchEnd?: () => void;
}

export const AnnouncementItem = ({
  announcement,
  isMobile,
  isExpanded,
  onToggleExpanded,
  onDismiss,
  onTouchStart,
  onTouchMove,
  onTouchEnd
}: AnnouncementItemProps) => {
  const displayText = isMobile && announcement.compact_text && !isExpanded
    ? announcement.compact_text
    : announcement.content;

  const textAlignClass = announcement.text_align === 'left' ? 'text-left' : 
                        announcement.text_align === 'right' ? 'text-right' : 
                        'text-center';

  return (
    <motion.div
      key={announcement.id}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="overflow-hidden"
      style={{
        backgroundColor: announcement.background_color,
        color: announcement.text_color
      }}
      onTouchStart={isMobile ? onTouchStart : undefined}
      onTouchMove={isMobile ? onTouchMove : undefined}
      onTouchEnd={isMobile ? onTouchEnd : undefined}
    >
      <div className={`px-4 py-3 ${isMobile ? 'text-sm' : 'text-base'} ${textAlignClass}`}>
        <div className={`flex items-center justify-between gap-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
          <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
            <div className={`flex items-start gap-2 ${isMobile ? 'flex-col' : 'flex-row items-center'} ${textAlignClass}`}>
              <div className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                {announcement.title}
              </div>
              {isMobile && announcement.mobile_layout === 'compact' && announcement.compact_text && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleExpanded}
                  className="p-1 h-auto text-current hover:bg-white/20"
                >
                  {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                </Button>
              )}
            </div>
            <div className={`mt-1 ${isMobile ? 'text-xs' : 'text-sm'} opacity-90`}>
              {displayText}
            </div>
          </div>

          <div className={`flex items-center gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
            {announcement.cta_text && announcement.cta_url && (
              <Button
                size={isMobile ? "sm" : "default"}
                variant="secondary"
                onClick={() => window.open(announcement.cta_url, '_blank')}
                className={`${isMobile ? 'flex-1 text-xs' : ''} bg-white/20 hover:bg-white/30 text-current border-white/30`}
              >
                {announcement.cta_text}
              </Button>
            )}

            {announcement.dismissible && (
              <Button
                variant="ghost"
                size={isMobile ? "sm" : "default"}
                onClick={onDismiss}
                className={`${isMobile ? 'min-w-[44px] h-[44px] p-0' : 'p-2'} text-current hover:bg-white/20`}
                aria-label="Dismiss announcement"
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
    </motion.div>
  );
};
