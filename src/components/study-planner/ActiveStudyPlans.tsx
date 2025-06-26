
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Calendar, Clock, Play, MoreHorizontal, Target } from 'lucide-react';
import { useActiveStudyPlans } from '@/hooks/useActiveStudyPlans';
import { StudyPlan } from '@/types/studyPlanner';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface ActiveStudyPlansProps {
  showAll: boolean;
}

export const ActiveStudyPlans = ({ showAll }: ActiveStudyPlansProps) => {
  const { studyPlans, isLoading } = useActiveStudyPlans();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Active Study Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const plansToShow = showAll ? studyPlans : studyPlans.slice(0, 3);

  if (plansToShow.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Study Plans</h3>
        <p className="text-gray-600 mb-4">Create your first study plan to start organizing your learning journey.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Active Study Plans</h2>
        {!showAll && studyPlans.length > 3 && (
          <Button variant="outline" size="sm">
            View All ({studyPlans.length})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plansToShow.map((plan) => (
          <StudyPlanCard key={plan.id} plan={plan} />
        ))}
      </div>
    </div>
  );
};

const StudyPlanCard = ({ plan }: { plan: StudyPlan }) => {
  const startDate = new Date(plan.start_date);
  const endDate = new Date(plan.end_date);
  const now = new Date();
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysPassed = Math.ceil((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysPassed);

  const handleStartSession = () => {
    // This will be implemented to start study sessions
    console.log('Start session for plan:', plan.id);
  };

  const handleConvertToGoal = () => {
    // This will be implemented to convert to goals
    console.log('Convert to goal:', plan.id);
  };

  return (
    <Card className="border-mint-200 hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg text-mint-700 mb-1">{plan.title}</CardTitle>
            <Badge variant="secondary" className="bg-mint-100 text-mint-700">
              {plan.subject}
            </Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleStartSession}>
                <Play className="h-4 w-4 mr-2" />
                Start Session
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleConvertToGoal}>
                <Target className="h-4 w-4 mr-2" />
                Convert to Goal
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Progress</span>
            <span>{plan.completion_percentage}%</span>
          </div>
          <Progress value={plan.completion_percentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{daysRemaining} days left</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{plan.total_duration_hours}h total</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{plan.sessions_completed} sessions completed</span>
          <span>{Array.isArray(plan.topics) ? plan.topics.length : 0} topics</span>
        </div>

        <Button 
          onClick={handleStartSession}
          className="w-full bg-mint-600 hover:bg-mint-700 text-white"
          size="sm"
        >
          <Play className="h-4 w-4 mr-2" />
          Start Study Session
        </Button>
      </CardContent>
    </Card>
  );
};
