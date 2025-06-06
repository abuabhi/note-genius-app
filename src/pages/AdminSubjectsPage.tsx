
import React from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSubjectList } from "@/components/admin/AdminSubjectList";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { BookOpen } from "lucide-react";

const AdminSubjectsPage = () => {
  // Set document title using React's useEffect
  React.useEffect(() => {
    document.title = "Admin - Subjects | StudyApp";
  }, []);

  return (
    <Layout>
      <div className="container mx-auto py-6 space-y-6">
        <PageBreadcrumb pageName="Subjects" pageIcon={<BookOpen className="h-4 w-4" />} />
        <h1 className="text-2xl font-bold">Subject Management</h1>
        
        <Tabs defaultValue="subjects">
          <TabsList>
            <TabsTrigger value="subjects">Manage Subjects</TabsTrigger>
            <TabsTrigger value="import">Import Subjects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subjects">
            <FlashcardProvider>
              <AdminSubjectList />
            </FlashcardProvider>
          </TabsContent>
          
          <TabsContent value="import">
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium mb-4">Import Subjects from CSV</h3>
              {/* Subject CSV import component would go here */}
              <p>Subject CSV import feature coming soon.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminSubjectsPage;
