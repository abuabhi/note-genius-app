import React from "react";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, ShieldAlert, TrendingUp } from "lucide-react";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { InfluencerAnalyticsDashboard } from "@/components/admin/influencers/InfluencerAnalyticsDashboard";

const InfluencerDashboardPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col justify-center items-center h-64">
          <Loader className="h-8 w-8 animate-spin mb-4" />
          <span className="text-muted-foreground">Loading...</span>
        </div>
      </div>
    );
  }
  
  // Check if user is an influencer
  if (!userProfile || !userProfile.is_influencer) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <ShieldAlert className="h-4 w-4" />
          <AlertDescription>
            You don't have permission to access the influencer dashboard. Contact support to become an influencer.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Influencer Portal" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <StandardPageHeader
        title="Influencer Dashboard"
        description="Manage your coupons, track performance, and view earnings"
        icon={<TrendingUp className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto p-6">
        <InfluencerAnalyticsDashboard />
      </div>
    </div>
  );
};

export default InfluencerDashboardPage;