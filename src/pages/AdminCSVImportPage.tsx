
import Layout from "@/components/layout/Layout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Upload } from "lucide-react";
import { CSVImport } from "@/components/admin/CSVImport";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

const AdminCSVImportPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  // Check if user is admin (DEAN tier)
  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <div className="container mx-auto p-6">
            <div className="flex justify-center items-center h-64">
              <span>Loading...</span>
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
    { label: "CSV Import" }
  ];

  return (
    <Layout>
      <FlashcardProvider>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <StandardPageHeader
            title="CSV Import"
            description="Bulk import grades, subjects, sections, and flashcards using CSV files"
            icon={<Upload className="h-6 w-6 text-white" />}
            breadcrumbs={breadcrumbs}
          />
          
          <div className="container mx-auto px-6 py-8">
            <CSVImport />
          </div>
        </div>
      </FlashcardProvider>
    </Layout>
  );
};

export default AdminCSVImportPage;
