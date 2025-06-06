
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnnouncementCard } from './AnnouncementCard';

interface Announcement {
  id: string;
  title: string;
  content: string;
  compact_text?: string;
  cta_text?: string;
  cta_url?: string;
  background_color: string;
  text_color: string;
  is_active: boolean;
  start_date: string;
  end_date: string;
  target_tier: string;
  target_pages: string[];
  mobile_layout: string;
  priority: number;
  dismissible: boolean;
  created_at: string;
}

interface AnnouncementsListProps {
  announcements: Announcement[];
  onEdit: (announcement: Announcement) => void;
  onPreview: (announcement: Announcement) => void;
  onToggleActive: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export const AnnouncementsList = ({
  announcements,
  onEdit,
  onPreview,
  onToggleActive,
  onDelete,
  isToggling,
  isDeleting
}: AnnouncementsListProps) => {
  if (announcements.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground text-center">
            No announcements created yet. Create your first announcement to get started.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          onEdit={onEdit}
          onPreview={onPreview}
          onToggleActive={onToggleActive}
          onDelete={onDelete}
          isToggling={isToggling}
          isDeleting={isDeleting}
        />
      ))}
    </div>
  );
};
