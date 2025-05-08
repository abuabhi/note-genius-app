
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
  const [activeTab, setActiveTab] = useState("manual");
  
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="p-0 h-8 w-8" 
                onClick={() => navigate('/quiz')}
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back</span>
              </Button>
              <h1 className="text-3xl font-bold">Create Quiz</h1>
            </div>
            <p className="text-muted-foreground">Create a new quiz manually or from your notes</p>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList>
            <TabsTrigger value="manual">Manual Creation</TabsTrigger>
            <TabsTrigger value="notes">Generate from Notes</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="mt-6">
            <CreateQuizForm />
          </TabsContent>
          
          <TabsContent value="notes" className="mt-6">
            <NoteToQuiz />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default CreateQuizPage;
