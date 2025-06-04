
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQuizForm } from "@/components/quiz/CreateQuizForm";
import { NoteToQuiz } from "@/components/quiz/NoteToQuiz";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const CreateQuizPage = () => {
  const { userProfile } = useRequireAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("notes");
  
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b">
          <div className="container mx-auto p-6">
            <div className="flex items-center gap-4 mb-4">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-2" 
                onClick={() => navigate('/quiz')}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <div>
                <h1 className="text-2xl font-semibold">Create Quiz</h1>
                <p className="text-muted-foreground">Create a new quiz manually or from your notes</p>
              </div>
            </div>
            
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="notes">Generate from Notes</TabsTrigger>
                <TabsTrigger value="manual">Manual Creation</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="notes" className="mt-0">
            <NoteToQuiz />
          </TabsContent>
          
          <TabsContent value="manual" className="mt-0">
            <div className="container mx-auto p-6">
              <div className="bg-white rounded-lg border p-6">
                <CreateQuizForm />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CreateQuizPage;
