
import React, { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useMobile } from '@/hooks/useMobile';
import { useAnnouncementData } from '@/hooks/announcements/useAnnouncementData';
import { useSwipeGesture } from '@/hooks/announcements/useSwipeGesture';
import { AnnouncementItem } from './AnnouncementItem';

export const AnnouncementBar = () => {
  const isMobile = useMobile();
  const { announcements, isLoading, handleDismiss } = useAnnouncementData();
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());

  const { handleTouchStart, handleTouchMove, handleTouchEnd } = useSwipeGesture(handleDismiss);

  const toggleExpanded = (announcementId: string) => {
    setExpandedAnnouncements(prev => {
      const newSet = new Set(prev);
      if (newSet.has(announcementId)) {
        newSet.delete(announcementId);
      } else {
        newSet.add(announcementId);
      }
      return newSet;
    });
  };

  if (isLoading || !announcements || announcements.length === 0) {
    return null;
  }

  return (
    <div className="relative z-40">
      <AnimatePresence>
        {announcements.map((announcement) => {
          const isExpanded = expandedAnnouncements.has(announcement.id);
          
          return (
            <AnnouncementItem
              key={announcement.id}
              announcement={announcement}
              isMobile={isMobile}
              isExpanded={isExpanded}
              onToggleExpanded={() => toggleExpanded(announcement.id)}
              onDismiss={() => handleDismiss(announcement.id)}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={() => handleTouchEnd(announcement.id)}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};
