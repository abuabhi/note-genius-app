
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Layout from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NotificationHistory } from '@/components/notifications/NotificationHistory';
import { NotificationPreferences } from '@/components/notifications/NotificationPreferences';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Bell, History, Settings } from 'lucide-react';

const NotificationsPage = () => {
  const breadcrumbs = [
    { label: "Notifications" }
  ];

  return (
    <>
      <Helmet>
        <title>Notifications - StudyMate</title>
        <meta name="description" content="Manage your notifications and preferences" />
      </Helmet>
      
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <StandardPageHeader
            title="Notifications"
            description="Manage your notification history and preferences"
            icon={<Bell className="h-6 w-6 text-white" />}
            breadcrumbs={breadcrumbs}
          />
          
          <div className="container mx-auto px-6 py-8">
            <div className="max-w-4xl mx-auto">
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
          </div>
        </div>
      </Layout>
    </>
  );
};

export default NotificationsPage;
