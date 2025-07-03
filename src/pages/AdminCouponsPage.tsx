import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, ShieldAlert, Ticket } from "lucide-react";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { CouponManagementPage } from "@/components/admin/coupons/CouponManagementPage";

const AdminCouponsPage = () => {
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
    { label: "Coupon Management" }
  ];

  return (
    <AdminLayout>
      <StandardPageHeader
        title="Coupon Management"
        description="Create and manage influencer coupon codes"
        icon={<Ticket className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <CouponManagementPage />
    </AdminLayout>
  );
};

export default AdminCouponsPage;