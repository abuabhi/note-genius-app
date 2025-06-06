
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Megaphone } from 'lucide-react';

interface AnnouncementHeaderProps {
  onCreateNew: () => void;
}

export const AnnouncementHeader = ({ onCreateNew }: AnnouncementHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center">
          <Megaphone className="h-6 w-6 mr-2 text-mint-600" />
          Announcement Management
        </h1>
        <p className="text-muted-foreground mt-1">
          Create and manage announcement bars that appear across the application
        </p>
      </div>
      <Button onClick={onCreateNew} className="bg-mint-600 hover:bg-mint-700">
        <Plus className="h-4 w-4 mr-2" />
        Create Announcement
      </Button>
    </div>
  );
};
