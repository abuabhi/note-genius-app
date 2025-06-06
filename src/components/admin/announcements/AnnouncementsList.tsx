
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { AnnouncementCard } from './AnnouncementCard';
import { Announcement } from './types';
import { PackageOpen } from 'lucide-react';

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
      <Card className="border-dashed border-2 border-mint-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <PackageOpen className="h-12 w-12 text-mint-400 mb-3" />
          <h3 className="text-lg font-medium mb-2">No announcements yet</h3>
          <p className="text-muted-foreground text-center max-w-md">
            Create your first announcement to start engaging with users across your application.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-5">
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
