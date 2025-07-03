import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader, ShieldAlert, Crown, Search } from "lucide-react";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInfluencerManagement } from "@/hooks/admin/useInfluencerManagement";
import { InfluencerManagementTable } from "@/components/admin/influencers/InfluencerManagementTable";
import { InfluencerExpirationAlerts } from "@/components/admin/influencers/InfluencerExpirationAlerts";

const AdminInfluencersPage = () => {
  const { userProfile, loading } = useRequireAuth();
  const {
    influencers,
    loading: influencersLoading,
    searchTerm,
    setSearchTerm,
    filter,
    setFilter,
    fetchInfluencers,
    revokeInfluencer,
    extendInfluencer,
  } = useInfluencerManagement();
  
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
    { label: "Influencer Management" }
  ];

  return (
    <AdminLayout>
      <StandardPageHeader
        title="Influencer Management"
        description="Manage influencer accounts and track performance"
        icon={<Crown className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        <InfluencerExpirationAlerts influencers={influencers} />
        
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search influencers by email or username..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filter influencers" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Influencers</SelectItem>
              <SelectItem value="expiring">Expiring Soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="graduate">Graduate Tier</SelectItem>
              <SelectItem value="master">Master Tier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {influencersLoading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-lg border">
            <div className="text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading influencers...</p>
            </div>
          </div>
        ) : (
          <InfluencerManagementTable
            influencers={influencers}
            revokeInfluencer={revokeInfluencer}
            extendInfluencer={extendInfluencer}
          />
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminInfluencersPage;