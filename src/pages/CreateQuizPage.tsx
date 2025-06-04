
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQuizForm } from "@/components/quiz/CreateQuizForm";
import { NoteToQuiz } from "@/components/quiz/NoteToQuiz";
import { QuizCreateBreadcrumb } from "@/components/quiz/QuizCreateBreadcrumb";

const CreateQuizPage = () => {
  const { userProfile } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("notes");
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="container mx-auto p-6 max-w-6xl">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <QuizCreateBreadcrumb />
          </div>
          
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-mint-800 mb-2">Create Quiz</h1>
            <p className="text-mint-600">Generate quizzes from your notes or create them manually</p>
          </div>
          
          {/* Main Content */}
          <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-mint-100 shadow-sm">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="border-b border-mint-100 px-6 pt-6">
                <TabsList className="bg-mint-50/50">
                  <TabsTrigger value="notes" className="data-[state=active]:bg-white data-[state=active]:text-mint-700">
                    Generate from Notes
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="data-[state=active]:bg-white data-[state=active]:text-mint-700">
                    Manual Creation
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <TabsContent value="notes" className="mt-0 p-0">
                <NoteToQuiz />
              </TabsContent>
              
              <TabsContent value="manual" className="mt-0 p-6">
                <CreateQuizForm />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreateQuizPage;
