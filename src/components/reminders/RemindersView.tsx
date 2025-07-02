
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Trash2, RefreshCw } from 'lucide-react';
import { useUnifiedReminderSystem } from '@/hooks/useUnifiedReminderSystem';
import { formatDistanceToNow } from 'date-fns';

export const RemindersView = () => {
  const {
    reminders,
    totalCount,
    unreadCount,
    isLoading,
    dismissReminder,
    dismissAll,
    isDismissing,
    refresh
  } = useUnifiedReminderSystem({
    enableRealtime: true,
    enableNotifications: true,
    limit: 1000
  });

  console.log('📋 RemindersView - UNIFIED SYSTEM ONLY - Total:', totalCount);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Reminders (Loading...)
          </CardTitle>
          <CardDescription>Loading your reminders via UNIFIED SYSTEM...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          🎯 UNIFIED Reminders System
          {totalCount > 0 && (
            <Badge variant="secondary">{totalCount}</Badge>
          )}
        </CardTitle>
        <CardDescription>
          Single source of truth - all other reminder systems deleted
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="destructive"
              size="sm"
              onClick={dismissAll}
              disabled={isDismissing}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {isDismissing ? 'Dismissing...' : `Dismiss All (${unreadCount})`}
            </Button>
          )}
        </div>

        {/* Reminders list */}
        {reminders.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Bell className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="text-lg font-medium">✅ All caught up!</p>
            <p className="text-sm">No reminders to show (cancelled ones are filtered out)</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="flex items-start justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{reminder.title}</p>
                    <Badge
                      variant={
                        reminder.status === 'pending' ? 'default' :
                        reminder.status === 'sent' ? 'destructive' : 'secondary'
                      }
                    >
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
                    <span>
                      Due: {reminder.reminder_time ? 
                        formatDistanceToNow(new Date(reminder.reminder_time), { addSuffix: true }) : 
                        'No time set'
                      }
                    </span>
                    <span>Priority: {reminder.priority}</span>
                    <span>Methods: {reminder.delivery_methods.join(', ')}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    console.log('🗑️ RemindersView dismissing via UNIFIED SYSTEM:', reminder.id);
                    dismissReminder(reminder.id);
                  }}
                  disabled={isDismissing}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
