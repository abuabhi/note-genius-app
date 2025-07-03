import React from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, ShieldAlert, Crown } from "lucide-react";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

const AdminInfluencersPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <div className="container mx-auto p-6">
            <div className="flex flex-col justify-center items-center h-64">
              <Loader className="h-8 w-8 animate-spin mb-4" />
              <span className="text-muted-foreground">Loading...</span>
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
    { label: "Influencer Management" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Influencer Management"
          description="Manage influencer accounts and track performance"
          icon={<Crown className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg border p-8 text-center">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Dedicated Influencer Dashboard</h3>
            <p className="text-muted-foreground mb-4">
              This dedicated influencer management dashboard is coming soon. 
              For now, you can manage influencers from the User Management page.
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminInfluencersPage;