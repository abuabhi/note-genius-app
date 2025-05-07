
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { FlashcardProvider, useFlashcards } from "@/contexts/FlashcardContext";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminFlashcardSetsList } from "@/components/admin/AdminFlashcardSetsList";
import { AdminSubjectList } from "@/components/admin/AdminSubjectList";
import { AdminFlashcardCreate } from "@/components/admin/AdminFlashcardCreate";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";

const AdminFlashcardPage = () => {
  const { userProfile, loading } = useRequireAuth();
  const navigate = useNavigate();
  
  // Check if user is admin (DEAN tier)
  useEffect(() => {
    if (!loading && userProfile?.user_tier !== UserTier.DEAN) {
      navigate('/dashboard');
    }
  }, [userProfile, loading, navigate]);
  
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
        <AdminContent />
      </FlashcardProvider>
    </Layout>
  );
};

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState("sets");
  
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Flashcard Administration</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList>
          <TabsTrigger value="sets">Manage Sets</TabsTrigger>
          <TabsTrigger value="subjects">Manage Subjects</TabsTrigger>
          <TabsTrigger value="create">Create Content</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sets" className="mt-6">
          <AdminFlashcardSetsList />
        </TabsContent>
        
        <TabsContent value="subjects" className="mt-6">
          <AdminSubjectList />
        </TabsContent>
        
        <TabsContent value="create" className="mt-6">
          <AdminFlashcardCreate />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminFlashcardPage;
