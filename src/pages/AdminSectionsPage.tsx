
import React from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Settings } from "lucide-react";
import SectionsContent from "@/components/admin/sections/SectionsContent";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

const AdminSectionsPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  // Check if user is admin (DEAN tier)
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <span>Loading...</span>
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
      <FlashcardProvider>
        <div className="container mx-auto p-6">
          <PageBreadcrumb pageName="Sections" pageIcon={<Settings className="h-4 w-4" />} />
          <SectionsContent />
        </div>
      </FlashcardProvider>
    </Layout>
  );
};

export default AdminSectionsPage;
