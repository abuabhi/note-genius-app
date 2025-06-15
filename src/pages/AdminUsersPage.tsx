
import React from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, ShieldAlert, Users } from "lucide-react";
import UserTierManagement from "@/components/admin/users/UserTierManagement";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

const AdminUsersPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  // Check if user is admin (DEAN tier)
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <div className="container mx-auto p-6">
            <div className="flex flex-col justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin mb-4" />
              <span className="text-muted-foreground">Loading user profile...</span>
            </div>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <div className="container mx-auto p-6">
            <Alert variant="destructive">
              <ShieldAlert className="h-4 w-4" />
              <AlertDescription>
                You don't have permission to access this page.
              </AlertDescription>
            </Alert>
          </div>
        </div>
      </Layout>
    );
  }

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "User Management" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="User Management"
          description="Manage user accounts, roles, and permissions"
          icon={<Users className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <UserTierManagement />
        </div>
      </div>
    </Layout>
  );
};

export default AdminUsersPage;
