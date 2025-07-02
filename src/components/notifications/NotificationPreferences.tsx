
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Clock, Mail, Smartphone } from 'lucide-react';

export const NotificationPreferences = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Manage how and when you receive notifications (UNIFIED SYSTEM)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Delivery Methods */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Delivery Methods</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bell className="h-4 w-4" />
                <Label htmlFor="in-app">In-App Notifications</Label>
              </div>
              <Switch id="in-app" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4" />
                <Label htmlFor="email">Email Notifications</Label>
              </div>
              <Switch id="email" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Smartphone className="h-4 w-4" />
                <Label htmlFor="push">Push Notifications</Label>
              </div>
              <Switch id="push" />
            </div>
          </div>

          {/* Timing Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Timing Settings</h3>
            
            <div className="space-y-2">
              <Label>Quiet Hours</Label>
              <div className="flex items-center gap-2">
                <Select defaultValue="22:00">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {`${i.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span>to</span>
                <Select defaultValue="08:00">
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 24 }, (_, i) => (
                      <SelectItem key={i} value={`${i.toString().padStart(2, '0')}:00`}>
                        {`${i.toString().padStart(2, '0')}:00`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Reminder Types */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Reminder Types</h3>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="study-reminders">Study Reminders</Label>
              <Switch id="study-reminders" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="goal-reminders">Goal Deadlines</Label>
              <Switch id="goal-reminders" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="flashcard-reminders">Flashcard Reviews</Label>
              <Switch id="flashcard-reminders" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="todo-reminders">Todo Reminders</Label>
              <Switch id="todo-reminders" defaultChecked />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
