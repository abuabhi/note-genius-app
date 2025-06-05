
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationHistory } from '@/components/notifications/NotificationHistory';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { Bell, History, Settings } from 'lucide-react';

const NotificationsPage = () => {
  return (
    <>
      <Helmet>
        <title>Notifications - StudyMate</title>
        <meta name="description" content="Manage your notifications and preferences" />
      </Helmet>
      
      <Layout>
        <div className="container mx-auto p-6 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="h-8 w-8 text-mint-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600">Manage your notification history and preferences</p>
            </div>
          </div>

          <Tabs defaultValue="history" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="history" className="mt-6">
              <NotificationHistory />
            </TabsContent>
            
            <TabsContent value="preferences" className="mt-6">
              <NotificationPreferences />
            </TabsContent>
          </Tabs>
        </div>
      </Layout>
    </>
  );
};

export default NotificationsPage;
