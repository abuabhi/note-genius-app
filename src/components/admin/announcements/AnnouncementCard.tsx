
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye, EyeOff, Smartphone } from 'lucide-react';
import { format } from 'date-fns';
import { Announcement } from './types';

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
      return <Badge variant="outline">Scheduled</Badge>;
    }
    
    if (now > endDate) {
      return <Badge variant="destructive">Expired</Badge>;
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg">{announcement.title}</CardTitle>
            <CardDescription>
              {announcement.content.slice(0, 100)}
              {announcement.content.length > 100 ? '...' : ''}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusBadge(announcement)}
            <Badge variant="outline" className="flex items-center gap-1">
              <Smartphone className="h-3 w-3" />
              {announcement.mobile_layout}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
          <div>
            <span className="font-medium">Target Tier:</span>
            <p className="text-muted-foreground">{announcement.target_tier}</p>
          </div>
          <div>
            <span className="font-medium">Priority:</span>
            <p className="text-muted-foreground">{announcement.priority}</p>
          </div>
          <div>
            <span className="font-medium">Start Date:</span>
            <p className="text-muted-foreground">
              {format(new Date(announcement.start_date), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
          <div>
            <span className="font-medium">End Date:</span>
            <p className="text-muted-foreground">
              {format(new Date(announcement.end_date), 'MMM dd, yyyy HH:mm')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPreview(announcement)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(announcement)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleActive(announcement)}
            disabled={isToggling}
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
      </CardContent>
    </Card>
  );
};
