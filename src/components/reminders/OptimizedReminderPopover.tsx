// @ts-nocheck - Simplified stub to prevent runtime errors
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Bell } from 'lucide-react';

export function OptimizedReminderPopover() {
  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="relative h-9 w-9 rounded-full hover:bg-gray-50 transition-colors"
      aria-label="Reminders disabled"
    >
      <Bell className="h-5 w-5 text-gray-600" />
    </Button>
  );
}