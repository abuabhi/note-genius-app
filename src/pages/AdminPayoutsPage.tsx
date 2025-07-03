import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, ShieldAlert, DollarSign } from "lucide-react";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { PayoutManagement } from "@/components/admin/payouts/PayoutManagement";

const AdminPayoutsPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex flex-col justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin mb-4" />
            <span className="text-muted-foreground">Loading...</span>
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
    { label: "Payout Management" }
  ];

  return (
    <AdminLayout>
      <StandardPageHeader
        title="Payout Management"
        description="Process and manage influencer payouts and commissions"
        icon={<DollarSign className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto p-6">
        <PayoutManagement />
      </div>
    </AdminLayout>
  );
};

export default AdminPayoutsPage;