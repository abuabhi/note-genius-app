
import React from 'react';
import { PlusCircle, Activity } from 'lucide-react';
import { QuizList } from '@/components/quiz/QuizList';
import QuizStats from '@/components/quiz/QuizStats';
import QuizProgressChart from '@/components/quiz/QuizProgressChart';
import QuizAchievements from '@/components/quiz/QuizAchievements';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Link } from 'react-router-dom';

const QuizPage = () => {
  const { loading: authLoading } = useRequireAuth();

  if (authLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 h-full">
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
        </div>
      </div>
    );
  }

  const breadcrumbs = [
    { label: "Quizzes" }
  ];

  const actions = (
    <Button asChild className="bg-gradient-to-r from-mint-500 to-blue-500 hover:from-mint-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
      <Link to="/quiz/create">
        <PlusCircle className="h-4 w-4 mr-2" />
        Create Quiz
      </Link>
    </Button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Quiz Center"
        description="Test your knowledge and track your progress"
        icon={<Activity className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      
      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="quizzes" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="quizzes">All Quizzes</TabsTrigger>
            <TabsTrigger value="stats">Statistics</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>

          <TabsContent value="quizzes">
            <Card className="p-6">
              <QuizList />
            </Card>
          </TabsContent>

          <TabsContent value="stats">
            <QuizStats />
          </TabsContent>

          <TabsContent value="progress">
            <QuizProgressChart />
          </TabsContent>

          <TabsContent value="achievements">
            <QuizAchievements />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default QuizPage;
