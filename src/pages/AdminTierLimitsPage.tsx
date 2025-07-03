
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, ShieldAlert, Settings } from "lucide-react";
import { TierLimitsManagement } from "@/components/admin/tier-limits/TierLimitsManagement";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

const AdminTierLimitsPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  // Check if user is admin (DEAN tier)
  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex flex-col justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin mb-4" />
            <span className="text-muted-foreground">Loading user profile...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }
  
  if (userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </AdminLayout>
    );
  }

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Tier Limits Management" }
  ];

  return (
    <AdminLayout>
      <StandardPageHeader
        title="Tier Limits Management"
        description="Configure usage limits and features for each user tier"
        icon={<Settings className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        <TierLimitsManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminTierLimitsPage;
