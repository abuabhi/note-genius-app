
import React from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSubjectList } from "@/components/admin/AdminSubjectList";
import { FlashcardProvider } from "@/contexts/FlashcardContext";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { BookOpen } from "lucide-react";

const AdminSubjectsPage = () => {
  // Set document title using React's useEffect
  React.useEffect(() => {
    document.title = "Admin - Subjects | StudyApp";
  }, []);

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "Subject Management" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Subject Management"
          description="Manage subjects and curriculum structure"
          icon={<BookOpen className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
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
      </div>
    </Layout>
  );
};

export default AdminSubjectsPage;
