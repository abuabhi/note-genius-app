
import React from "react";
import Layout from "@/components/layout/Layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminSubjectList } from "@/components/admin/AdminSubjectList";
import { Helmet } from "react-helmet";

const AdminSubjectsPage = () => {
  return (
    <Layout>
      <Helmet>
        <title>Admin - Subjects | StudyApp</title>
      </Helmet>
      
      <div className="container mx-auto py-6 space-y-6">
        <h1 className="text-2xl font-bold">Subject Management</h1>
        
        <Tabs defaultValue="subjects">
          <TabsList>
            <TabsTrigger value="subjects">Manage Subjects</TabsTrigger>
            <TabsTrigger value="import">Import Subjects</TabsTrigger>
          </TabsList>
          
          <TabsContent value="subjects">
            <AdminSubjectList />
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
