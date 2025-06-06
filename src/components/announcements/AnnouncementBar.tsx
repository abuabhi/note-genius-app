
import React, { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { useMobile } from '@/hooks/use-mobile';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

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
}

export const AnnouncementBar = () => {
  const { user, userProfile } = useAuth();
  const isMobile = useMobile();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [expandedAnnouncements, setExpandedAnnouncements] = useState<Set<string>>(new Set());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ['active-announcements', userProfile?.user_tier, location.pathname],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase.rpc('get_active_announcements', {
        user_tier_param: userProfile?.user_tier || 'SCHOLAR',
        current_page: location.pathname
      });

      if (error) {
        console.error('Error fetching announcements:', error);
        return [];
      }

      // Filter out dismissed announcements
      if (data && data.length > 0) {
        const { data: dismissed } = await supabase
          .from('user_dismissed_announcements')
          .select('announcement_id')
          .eq('user_id', user.id);

        const dismissedIds = new Set(dismissed?.map(d => d.announcement_id) || []);
        return data.filter((announcement: Announcement) => !dismissedIds.has(announcement.id));
      }

      return data || [];
    },
    enabled: !!user
  });

  const dismissMutation = useMutation({
    mutationFn: async (announcementId: string) => {
      const { error } = await supabase.rpc('dismiss_announcement', {
        announcement_uuid: announcementId
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['active-announcements'] });
    }
  });

  const handleDismiss = (announcementId: string) => {
    dismissMutation.mutate(announcementId);
  };

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

  // Swipe gesture handling for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (announcementId: string) => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe || isRightSwipe) {
      handleDismiss(announcementId);
    }
  };

  if (isLoading || !announcements || announcements.length === 0) {
    return null;
  }

  return (
    <div className="relative z-40">
      <AnimatePresence>
        {announcements.map((announcement: Announcement) => {
          const isExpanded = expandedAnnouncements.has(announcement.id);
          const displayText = isMobile && announcement.compact_text && !isExpanded
            ? announcement.compact_text
            : announcement.content;
          
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
              onTouchStart={isMobile ? handleTouchStart : undefined}
              onTouchMove={isMobile ? handleTouchMove : undefined}
              onTouchEnd={isMobile ? () => handleTouchEnd(announcement.id) : undefined}
            >
              <div className={`px-4 py-3 ${isMobile ? 'text-sm' : 'text-base'}`}>
                <div className={`flex items-center justify-between gap-3 ${isMobile ? 'flex-col' : 'flex-row'}`}>
                  <div className={`flex-1 ${isMobile ? 'w-full' : ''}`}>
                    <div className={`flex items-start gap-2 ${isMobile ? 'flex-col' : 'flex-row items-center'}`}>
                      <div className={`font-medium ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {announcement.title}
                      </div>
                      {isMobile && announcement.mobile_layout === 'compact' && announcement.compact_text && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpanded(announcement.id)}
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
                        onClick={() => handleDismiss(announcement.id)}
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
        })}
      </AnimatePresence>
    </div>
  );
};
