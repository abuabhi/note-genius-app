
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { UserTier } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnnouncementManagement } from "@/components/admin/announcements/AnnouncementManagement";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { Megaphone } from "lucide-react";

const AdminAnnouncementsPage = () => {
  const { user, userProfile } = useRequireAuth();

  if (!user || userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Announcement Management" }
  ];

  return (
    <AdminLayout>
      <StandardPageHeader
        title="Announcement Management"
        description="Create and manage system-wide announcements for users"
        icon={<Megaphone className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        <AnnouncementManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncementsPage;
