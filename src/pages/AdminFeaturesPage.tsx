
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useRequireAuth, UserTier } from '@/hooks/useRequireAuth';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader, ShieldAlert } from 'lucide-react';
import AdminFeatureToggle from '@/components/admin/features/AdminFeatureToggle';

const AdminFeaturesPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  // Check if user is admin (DEAN tier)
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex flex-col justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin mb-4" />
            <span className="text-muted-foreground">Loading user profile...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Feature Management</h1>
        <AdminFeatureToggle />
      </div>
    </Layout>
  );
};

export default AdminFeaturesPage;
