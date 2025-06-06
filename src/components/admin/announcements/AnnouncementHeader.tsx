
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface AnnouncementHeaderProps {
  onCreateNew: () => void;
}

export const AnnouncementHeader = ({ onCreateNew }: AnnouncementHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-2xl font-bold">Announcements</h2>
        <p className="text-muted-foreground">
          Manage announcement bars that appear across the application
        </p>
      </div>
      <Button onClick={onCreateNew}>
        <Plus className="h-4 w-4 mr-2" />
        Create Announcement
      </Button>
    </div>
  );
};
