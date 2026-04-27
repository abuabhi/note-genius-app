
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateQuizForm } from "@/components/quiz/CreateQuizForm";
import { NoteToQuiz } from "@/components/quiz/NoteToQuiz";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { PlusCircle } from "lucide-react";

const CreateQuizPageContent = () => {
  const { userProfile } = useRequireAuth();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") === "manual" ? "manual" : "notes";
  const [activeTab, setActiveTab] = useState(initialTab);

  const breadcrumbs = [
    { label: "Quizzes", href: "/quizzes" },
    { label: "Create Quiz" }
  ];
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Create Quiz"
        description="Generate quizzes from your notes or create them manually"
        icon={<PlusCircle className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-6xl mx-auto">
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
    </div>
  );
};

const CreateQuizPage = () => {
  return <CreateQuizPageContent />;
};

export default CreateQuizPage;
