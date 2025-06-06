
import React from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { UserTier } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementManagement } from "@/components/admin/announcements/AnnouncementManagement";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { Megaphone } from "lucide-react";

const AdminAnnouncementsPage = () => {
  const { user, userProfile } = useRequireAuth();

  if (!user || userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need Dean-tier access to manage announcements.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <PageBreadcrumb 
          pageName="Announcement Management" 
          pageIcon={<Megaphone className="h-4 w-4" />} 
        />
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Announcement Management</h1>
          <p className="text-muted-foreground">
            Create and manage announcement bars for users across the application
          </p>
        </div>
        <AnnouncementManagement />
      </div>
    </Layout>
  );
};

export default AdminAnnouncementsPage;
