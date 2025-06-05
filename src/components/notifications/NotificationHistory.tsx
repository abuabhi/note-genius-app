
import React, { useState } from 'react';
import { format, isToday, isYesterday, startOfDay, subDays } from 'date-fns';
import { Bell, Clock, CalendarClock, BrainCircuit, Check, X, Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useReminderNotifications } from '@/hooks/useReminderNotifications';
import { Skeleton } from '@/components/ui/skeleton';

export const NotificationHistory = () => {
  const { pendingReminders, loading } = useReminderNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getReminderIcon = (type: string) => {
    switch (type) {
      case 'study_event':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'goal_deadline':
        return <CalendarClock className="h-4 w-4 text-green-500" />;
      case 'flashcard_review':
        return <BrainCircuit className="h-4 w-4 text-purple-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="h-4 w-4 text-green-500" />;
      case 'dismissed':
        return <X className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'sent':
        return <Badge variant="outline" className="text-green-600 border-green-200">Active</Badge>;
      case 'dismissed':
        return <Badge variant="outline" className="text-gray-600 border-gray-200">Dismissed</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-orange-600 border-orange-200">Pending</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getFormattedDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy \'at\' h:mm a');
    }
  };

  // Filter reminders based on search and filters
  const filteredReminders = pendingReminders.filter(reminder => {
    const matchesSearch = reminder.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (reminder.description && reminder.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesType = filterType === 'all' || reminder.type === filterType;
    const matchesStatus = filterStatus === 'all' || reminder.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Group reminders by date
  const groupedReminders = filteredReminders.reduce((groups, reminder) => {
    const date = startOfDay(new Date(reminder.reminder_time)).toISOString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(reminder);
    return groups;
  }, {} as Record<string, typeof filteredReminders>);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-40" />
          <Skeleton className="h-10 w-40" />
        </div>
        {[1, 2, 3].map(i => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex gap-3 flex-1">
                  <Skeleton className="h-6 w-6 rounded" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Notification History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="study_event">Study Events</SelectItem>
                <SelectItem value="goal_deadline">Goal Deadlines</SelectItem>
                <SelectItem value="flashcard_review">Flashcard Reviews</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Active</SelectItem>
                <SelectItem value="dismissed">Dismissed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notification List */}
          <ScrollArea className="h-[600px]">
            {Object.keys(groupedReminders).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="font-medium text-lg mb-2">No notifications found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || filterType !== 'all' || filterStatus !== 'all' 
                    ? "Try adjusting your filters to see more notifications."
                    : "You don't have any notifications yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedReminders)
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                  .map(([dateKey, reminders]) => (
                    <div key={dateKey}>
                      <h4 className="font-medium text-sm text-muted-foreground mb-3 sticky top-0 bg-background py-2">
                        {format(new Date(dateKey), 'EEEE, MMMM d, yyyy')}
                      </h4>
                      <div className="space-y-2">
                        {reminders
                          .sort((a, b) => new Date(b.reminder_time).getTime() - new Date(a.reminder_time).getTime())
                          .map((reminder) => (
                            <Card key={reminder.id} className="hover:bg-muted/20 transition-colors">
                              <CardContent className="p-4">
                                <div className="flex justify-between items-start">
                                  <div className="flex gap-3 flex-1">
                                    <div className="flex flex-col items-center gap-1">
                                      {getReminderIcon(reminder.type)}
                                      {getStatusIcon(reminder.status)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <h5 className="font-medium text-sm mb-1 truncate">{reminder.title}</h5>
                                      {reminder.description && (
                                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                          {reminder.description}
                                        </p>
                                      )}
                                      <p className="text-xs text-muted-foreground">
                                        {getFormattedDate(reminder.reminder_time)}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex flex-col items-end gap-2">
                                    {getStatusBadge(reminder.status)}
                                    <Badge variant="secondary" className="text-xs">
                                      {reminder.type.replace('_', ' ')}
                                    </Badge>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
