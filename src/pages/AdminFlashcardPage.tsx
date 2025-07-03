
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import { FlashcardProvider, useFlashcards } from "@/contexts/FlashcardContext";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminFlashcardSetsList } from "@/components/admin/AdminFlashcardSetsList";
import { AdminSubjectList } from "@/components/admin/AdminSubjectList";
import { AdminFlashcardCreate } from "@/components/admin/AdminFlashcardCreate";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert, Layers } from "lucide-react";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

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
    { label: "Flashcard Administration" }
  ];

  return (
    <AdminLayout>
      <FlashcardProvider>
        <StandardPageHeader
          title="Flashcard Administration"
          description="Manage flashcard sets, subjects, and create content"
          icon={<Layers className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <AdminContent />
        </div>
      </FlashcardProvider>
    </AdminLayout>
  );
};

const AdminContent = () => {
  const [activeTab, setActiveTab] = useState("sets");
  
  return (
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
  );
};

export default AdminFlashcardPage;
