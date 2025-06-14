
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useEmailDigestPreferences } from '@/hooks/useEmailDigestPreferences';
import { Skeleton } from '@/components/ui/skeleton';
import { Mail, Clock, Filter } from 'lucide-react';

export const EmailDigestSettings: React.FC = () => {
  const { preferences, loading, updatePreferences } = useEmailDigestPreferences();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Digest Settings
          </CardTitle>
          <CardDescription>
            Configure your daily email digest preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground text-center">
            Failed to load email digest preferences
          </p>
        </CardContent>
      </Card>
    );
  }

  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, '0');
    const time12 = i === 0 ? '12:00 AM' : 
                  i < 12 ? `${i}:00 AM` : 
                  i === 12 ? '12:00 PM' : 
                  `${i - 12}:00 PM`;
    return { value: `${hour}:00:00`, label: time12 };
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Email Digest Settings
        </CardTitle>
        <CardDescription>
          Configure your daily email digest preferences to stay on top of your goals and tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enable/Disable Digest */}
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="digest-enabled" className="text-base font-medium">
              Enable Daily Digest
            </Label>
            <p className="text-sm text-muted-foreground">
              Receive a daily email summary of your goals and tasks
            </p>
          </div>
          <Switch
            id="digest-enabled"
            checked={preferences.digest_enabled}
            onCheckedChange={(checked) => 
              updatePreferences({ digest_enabled: checked })
            }
          />
        </div>

        <Separator />

        {/* Frequency and Timing */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <Label className="text-base font-medium">Schedule</Label>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select
                value={preferences.frequency}
                onValueChange={(value: 'daily' | 'weekly' | 'never') => 
                  updatePreferences({ frequency: value })
                }
                disabled={!preferences.digest_enabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="never">Never</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="digest-time">Delivery Time</Label>
              <Select
                value={preferences.digest_time}
                onValueChange={(value) => 
                  updatePreferences({ digest_time: value })
                }
                disabled={!preferences.digest_enabled || preferences.frequency === 'never'}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Content Filters */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <Label className="text-base font-medium">Content Preferences</Label>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="include-goals">Include Goals</Label>
                <p className="text-sm text-muted-foreground">
                  Show your active study goals in the digest
                </p>
              </div>
              <Switch
                id="include-goals"
                checked={preferences.include_goals}
                onCheckedChange={(checked) => 
                  updatePreferences({ include_goals: checked })
                }
                disabled={!preferences.digest_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="include-todos">Include Todos</Label>
                <p className="text-sm text-muted-foreground">
                  Show your pending tasks in the digest
                </p>
              </div>
              <Switch
                id="include-todos"
                checked={preferences.include_todos}
                onCheckedChange={(checked) => 
                  updatePreferences({ include_todos: checked })
                }
                disabled={!preferences.digest_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="include-completed">Include Completed Items</Label>
                <p className="text-sm text-muted-foreground">
                  Show recently completed goals and tasks
                </p>
              </div>
              <Switch
                id="include-completed"
                checked={preferences.include_completed}
                onCheckedChange={(checked) => 
                  updatePreferences({ include_completed: checked })
                }
                disabled={!preferences.digest_enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="only-urgent">Urgent Items Only</Label>
                <p className="text-sm text-muted-foreground">
                  Only include high-priority and overdue items
                </p>
              </div>
              <Switch
                id="only-urgent"
                checked={preferences.only_urgent}
                onCheckedChange={(checked) => 
                  updatePreferences({ only_urgent: checked })
                }
                disabled={!preferences.digest_enabled}
              />
            </div>
          </div>
        </div>

        {/* Last Digest Info */}
        {preferences.last_digest_sent_at && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Last digest sent: {new Date(preferences.last_digest_sent_at).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
