
import React, { useState } from 'react';
import QuizList from '@/components/quiz/QuizList';
import QuizStats from '@/components/quiz/QuizStats';
import QuizProgressChart from '@/components/quiz/QuizProgressChart';
import QuizAchievements from '@/components/quiz/QuizAchievements';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuizPageHeader } from '@/components/quiz/QuizPageHeader';
import { useNavigate } from 'react-router-dom';

const QuizPage = () => {
  const { loading: authLoading } = useRequireAuth();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const handleCreateQuiz = () => {
    navigate('/quiz/create');
  };

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6 h-full">
          <div className="flex justify-center items-center h-[50vh]">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
              <p className="text-gray-600">Loading your quizzes...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <QuizPageHeader
        loading={false}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        onOpenCreateDialog={handleCreateQuiz}
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
            <QuizList viewMode={viewMode} />
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
