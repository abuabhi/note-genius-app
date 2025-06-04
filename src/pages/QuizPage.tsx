
import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Layout from "@/components/layout/Layout";
import { QuizList } from "@/components/quiz/QuizList";
import { QuizStats } from "@/components/quiz/QuizStats";
import { QuizAchievements } from "@/components/quiz/QuizAchievements";
import { Button } from "@/components/ui/button";
import { Plus, Trophy, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const QuizPage = () => {
  const { userProfile } = useRequireAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("quizzes");

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-mint-50/30 to-mint-50/10">
        <div className="container mx-auto p-6">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-mint-800 mb-2">Quizzes</h1>
                <p className="text-mint-600">Test your knowledge and track your progress</p>
              </div>
              <Button 
                onClick={() => navigate('/create-quiz')}
                className="bg-mint-600 hover:bg-mint-700 text-white"
              >
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-mint-50">
              <TabsTrigger value="quizzes" className="data-[state=active]:bg-mint-600 data-[state=active]:text-white">
                <Plus className="mr-2 h-4 w-4" />
                My Quizzes
              </TabsTrigger>
              <TabsTrigger value="stats" className="data-[state=active]:bg-mint-600 data-[state=active]:text-white">
                <BarChart3 className="mr-2 h-4 w-4" />
                Statistics
              </TabsTrigger>
              <TabsTrigger value="achievements" className="data-[state=active]:bg-mint-600 data-[state=active]:text-white">
                <Trophy className="mr-2 h-4 w-4" />
                Achievements
              </TabsTrigger>
            </TabsList>

            <TabsContent value="quizzes">
              <QuizList />
            </TabsContent>

            <TabsContent value="stats">
              <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                <CardHeader>
                  <CardTitle className="text-mint-800">Quiz Statistics</CardTitle>
                  <CardDescription className="text-mint-600">
                    Your quiz performance over time
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuizStats />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="achievements">
              <Card className="bg-white/60 backdrop-blur-sm border-mint-100">
                <CardHeader>
                  <CardTitle className="text-mint-800">Achievements</CardTitle>
                  <CardDescription className="text-mint-600">
                    Your quiz milestones and accomplishments
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <QuizAchievements />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default QuizPage;
