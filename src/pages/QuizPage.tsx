
import React from 'react';
import { PlusCircle, Activity } from 'lucide-react';
import Layout from '@/components/layout/Layout';
import { QuizList } from '@/components/quiz/QuizList';
import QuizStats from '@/components/quiz/QuizStats';
import QuizProgressChart from '@/components/quiz/QuizProgressChart';
import QuizAchievements from '@/components/quiz/QuizAchievements';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FeatureDisabledAlert } from '@/components/routes/FeatureProtectedRoute';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';

const QuizPage = () => {
  const { loading: authLoading } = useRequireAuth();

  if (authLoading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 md:p-6 h-full">
          <div className="flex justify-center items-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Quizzes" pageIcon={<Activity className="h-3 w-3" />} />
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Activity className="h-7 w-7" />
              Quiz Center
            </h1>
            <p className="text-muted-foreground mt-1">
              Test your knowledge and track your progress
            </p>
          </div>
          <Button asChild className="flex items-center gap-2">
            <a href="/create-quiz">
              <PlusCircle className="h-4 w-4" />
              Create Quiz
            </a>
          </Button>
        </div>

        <FeatureDisabledAlert featureKey="quizzes" featureDisplayName="Quiz Center" />

        {/* Main Content */}
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
    </Layout>
  );
};

export default QuizPage;
