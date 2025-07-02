
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Bell, Clock, CheckCircle2, AlertTriangle } from 'lucide-react';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { formatDistanceToNow } from 'date-fns';

export const NotificationHistory = () => {
  const { 
    reminders, 
    isLoading, 
    dismissReminder,
    isDismissing 
  } = useUnifiedReminderSystem({
    enableRealtime: true,
    limit: 100
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading notifications...</p>
        </CardContent>
      </Card>
    );
  }

  // Sort reminders by most recent first
  const sortedReminders = [...reminders].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Notification History
        </CardTitle>
        <CardDescription>
          Your recent reminders and notifications (UNIFIED SYSTEM)
        </CardDescription>
      </CardHeader>
      <CardContent>
        {sortedReminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No notifications to show</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedReminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start justify-between p-3 border rounded-lg"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{reminder.title}</p>
                    <Badge variant={reminder.status === 'sent' ? 'destructive' : 'default'}>
                      {reminder.status}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {reminder.type}
                    </Badge>
                  </div>
                  {reminder.description && (
                    <p className="text-sm text-muted-foreground">
                      {reminder.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(reminder.created_at), { addSuffix: true })}
                    </span>
                    <span>Priority: {reminder.priority}</span>
                  </div>
                </div>
                {reminder.status === 'sent' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => dismissReminder(reminder.id)}
                    disabled={isDismissing}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
