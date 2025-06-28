
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationHistory } from '@/components/notifications/NotificationHistory';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { NotificationSettingsPanel } from '@/components/dashboard/NotificationSettingsPanel';
import { Bell, History, Settings, BrainCircuit } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <>
      <Helmet>
        <title>Notifications - PrepGenie</title>
        <meta name="description" content="Manage your notifications and preferences" />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        {/* Header */}
        <div className="bg-gradient-to-r from-mint-500 to-blue-600 text-white">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center gap-3">
              <Bell className="h-8 w-8" />
              <div>
                <h1 className="text-3xl font-bold">Notifications</h1>
                <p className="text-mint-100 mt-1">
                  Manage your notification history, preferences, and smart settings
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="history" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  History
                </TabsTrigger>
                <TabsTrigger value="preferences" className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Preferences
                </TabsTrigger>
                <TabsTrigger value="smart-settings" className="flex items-center gap-2">
                  <BrainCircuit className="h-4 w-4" />
                  Smart Settings
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="history" className="mt-6">
                <NotificationHistory />
              </TabsContent>
              
              <TabsContent value="preferences" className="mt-6">
                <NotificationPreferences />
              </TabsContent>
              
              <TabsContent value="smart-settings" className="mt-6">
                <NotificationSettingsPanel />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;
