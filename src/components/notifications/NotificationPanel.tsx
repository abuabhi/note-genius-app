
import React from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export const NotificationPanel = () => {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="h-9 w-9 rounded-full hover:bg-gray-100 transition-colors"
      aria-label="Notifications"
    >
      <Bell className="h-5 w-5" />
    </Button>
  );
};
