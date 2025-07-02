
import React from 'react';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ReminderSystemSetup } from '@/components/admin/ReminderSystemSetup';

export const ReminderDebugPanel = () => {
  const {
    reminders,
    totalCount,
    unreadCount,
    isLoading,
    error,
    dismissReminder,
    dismissAll,
    isDismissing,
    refresh
  } = useUnifiedReminderSystem({
    enableRealtime: true,
    enableNotifications: true,
    limit: 1000
  });

  const handleRefresh = () => {
    refresh();
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reminder Debug Panel - UNIFIED SYSTEM ONLY</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading reminders...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Reminder Debug Panel - UNIFIED SYSTEM ONLY</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">Error: {error.message}</p>
          <Button onClick={handleRefresh} className="mt-2">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>🎯 UNIFIED Reminder System - Single Source of Truth</CardTitle>
          <CardDescription>
            ALL other reminder systems have been DELETED. This is the ONLY system now.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-center">
            <Badge variant="outline">Total: {totalCount}</Badge>
            <Badge variant="destructive">Unread: {unreadCount}</Badge>
            <Badge variant="secondary">Status Filter: pending, sent (EXCLUDES cancelled)</Badge>
            <Button onClick={handleRefresh} size="sm" variant="outline">
              Refresh
            </Button>
            <Button 
              onClick={dismissAll} 
              size="sm" 
              variant="destructive"
              disabled={isDismissing || unreadCount === 0}
            >
              {isDismissing ? 'Dismissing...' : `Dismiss All (${unreadCount})`}
            </Button>
          </div>

          <div className="space-y-2">
            <h4 className="font-medium">Reminders ({reminders.length}) - UNIFIED SYSTEM</h4>
            {reminders.length === 0 ? (
              <p className="text-muted-foreground">✅ All caught up! No reminders found (cancelled ones are filtered out)</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {reminders.map((reminder) => (
                  <div 
                    key={reminder.id} 
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{reminder.title}</span>
                        <Badge variant={reminder.status === 'pending' ? 'default' : 'secondary'}>
                          {reminder.status}
                        </Badge>
                        <Badge variant="outline">{reminder.type}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Due: {reminder.reminder_time ? new Date(reminder.reminder_time).toLocaleString() : 'No time set'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Methods: {Array.isArray(reminder.delivery_methods) ? reminder.delivery_methods.join(', ') : 'in_app'}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        console.log('🗑️ Debug panel dismissing via UNIFIED SYSTEM:', reminder.id);
                        dismissReminder(reminder.id);
                      }}
                      disabled={isDismissing}
                    >
                      Dismiss
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <ReminderSystemSetup />
    </div>
  );
};
