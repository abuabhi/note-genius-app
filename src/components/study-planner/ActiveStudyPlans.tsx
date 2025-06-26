
import React from 'react';
import { useActiveStudyPlans } from '@/hooks/useActiveStudyPlans';
import { StudyPlanCard } from './StudyPlanCard';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';

interface ActiveStudyPlansProps {
  showAll?: boolean;
}

export const ActiveStudyPlans = ({ showAll = false }: ActiveStudyPlansProps) => {
  const { studyPlans, isLoading, error } = useActiveStudyPlans();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="p-6 text-center">
          <p className="text-red-600">Error loading study plans</p>
        </CardContent>
      </Card>
    );
  }

  if (studyPlans.length === 0) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-8 text-center">
          <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Study Plans</h3>
          <p className="text-gray-600">Create your first study plan to get started with organized learning.</p>
        </CardContent>
      </Card>
    );
  }

  const plansToShow = showAll ? studyPlans : studyPlans.slice(0, 6);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {plansToShow.map((studyPlan) => (
        <StudyPlanCard key={studyPlan.id} studyPlan={studyPlan} />
      ))}
    </div>
  );
};
