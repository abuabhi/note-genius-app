
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff, Smartphone, CalendarClock, Target } from 'lucide-react';
import { format } from 'date-fns';
import { Announcement } from './types';
import { RichTextDisplay } from '@/components/ui/rich-text/RichTextDisplay';

interface AnnouncementCardProps {
  announcement: Announcement;
  onEdit: (announcement: Announcement) => void;
  onPreview: (announcement: Announcement) => void;
  onToggleActive: (announcement: Announcement) => void;
  onDelete: (id: string) => void;
  isToggling: boolean;
  isDeleting: boolean;
}

export const AnnouncementCard = ({
  announcement,
  onEdit,
  onPreview,
  onToggleActive,
  onDelete,
  isToggling,
  isDeleting
}: AnnouncementCardProps) => {
  const getStatusBadge = (announcement: Announcement) => {
    const now = new Date();
    const startDate = new Date(announcement.start_date);
    const endDate = new Date(announcement.end_date);

    if (!announcement.is_active) {
      return <Badge variant="secondary">Inactive</Badge>;
    }
    
    if (now < startDate) {
      return <Badge variant="outline" className="border-amber-300 text-amber-600 bg-amber-50">Scheduled</Badge>;
    }
    
    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="default" className="bg-mint-600 hover:bg-mint-700">Active</Badge>;
  };

  const isActive = announcement.is_active;
  const now = new Date();
  const startDate = new Date(announcement.start_date);
  const endDate = new Date(announcement.end_date);
  const isScheduled = now < startDate && isActive;
  const isExpired = now > endDate && isActive;
  
  return (
    <Card className="overflow-hidden transition-all hover:shadow-md border-mint-100">
      <div className={`h-1.5 w-full ${isActive ? 'bg-mint-600' : 'bg-gray-200'}`}></div>
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1 flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-medium text-mint-800">{announcement.title}</h3>
              <div>{getStatusBadge(announcement)}</div>
            </div>
            <div className="text-muted-foreground text-sm max-h-20 overflow-hidden">
              <RichTextDisplay 
                content={announcement.content.slice(0, 150)} 
                removeTitle={true}
              />
              {announcement.content.length > 150 ? '...' : ''}
            </div>
          </div>
          <div className="flex items-center gap-1.5 ml-4">
            <Badge variant="outline" className="flex items-center gap-1 text-xs">
              <Smartphone className="h-3 w-3" />
              {announcement.mobile_layout}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm mb-4">
          <div className="flex items-center space-x-2">
            <CalendarClock className="h-4 w-4 text-mint-600" />
            <div>
              <div className="text-xs text-muted-foreground">Start</div>
              <div>{format(new Date(announcement.start_date), 'MMM dd, yyyy HH:mm')}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarClock className="h-4 w-4 text-mint-600" />
            <div>
              <div className="text-xs text-muted-foreground">End</div>
              <div>{format(new Date(announcement.end_date), 'MMM dd, yyyy HH:mm')}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Target className="h-4 w-4 text-mint-600" />
            <div>
              <div className="text-xs text-muted-foreground">Target</div>
              <div>{announcement.target_tier || 'All tiers'}</div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(announcement)}
            className="border-mint-200 text-mint-700 hover:bg-mint-50"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(announcement)}
            className="border-mint-200 text-mint-700 hover:bg-mint-50"
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(announcement)}
            disabled={isToggling}
            className={isActive ? "border-amber-200 text-amber-700 hover:bg-amber-50" : "border-mint-200 text-mint-700 hover:bg-mint-50"}
          >
            {announcement.is_active ? (
              <>
                <EyeOff className="h-4 w-4 mr-2" />
                Deactivate
              </>
            ) : (
              <>
                <Eye className="h-4 w-4 mr-2" />
                Activate
              </>
            )}
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete(announcement.id)}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
};
