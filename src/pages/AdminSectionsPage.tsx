
import React from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Layers } from "lucide-react";
import SectionsContent from "@/components/admin/sections/SectionsContent";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

const AdminSectionsPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  // Check if user is admin (DEAN tier)
  if (loading) {
    return (
      <AdminLayout>
        <div className="container mx-auto p-6">
          <div className="flex justify-center items-center h-64">
            <span>Loading...</span>
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
    { label: "Sections" }
  ];

  return (
    <AdminLayout>
      <FlashcardProvider>
        <StandardPageHeader
          title="Sections Management"
          description="Manage course sections and organizational structure"
          icon={<Layers className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <SectionsContent />
        </div>
      </FlashcardProvider>
    </AdminLayout>
  );
};

export default AdminSectionsPage;
