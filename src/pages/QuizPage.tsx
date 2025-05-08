
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import QuizList from "@/components/quiz/QuizList";
import QuizProgressChart from "@/components/quiz/QuizProgressChart";
import QuizStats from "@/components/quiz/QuizStats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useNavigate } from "react-router-dom";

const QuizPage = () => {
  const { userProfile } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("quizzes");
  const navigate = useNavigate();
  
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-1">Quizzes</h1>
            <p className="text-muted-foreground">Test your knowledge and track your learning progress</p>
          </div>
          <Button 
            className="mt-4 sm:mt-0"
            onClick={() => navigate("/quiz/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Quiz
          </Button>
        </div>
        
        <QuizStats />
        
        <div className="mt-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="quizzes">Available Quizzes</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>
            
            <TabsContent value="quizzes" className="mt-6">
              <QuizList />
            </TabsContent>
            
            <TabsContent value="progress" className="mt-6">
              <QuizProgressChart />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default QuizPage;
