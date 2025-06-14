
import React from 'react';
import { GoalAnalytics } from '@/components/goals/GoalAnalytics';
import { StudyAnalyticsDashboard } from '@/components/study/StudyAnalyticsDashboard';
import { useStudyGoals } from '@/hooks/useStudyGoals';

export const DetailedAnalytics = () => {
  const { goals } = useStudyGoals();

  return (
    <div className="space-y-8">
      {/* Study Analytics Dashboard */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Study Performance Analytics</h2>
        <StudyAnalyticsDashboard />
      </div>

      {/* Goal Analytics */}
      {goals.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Goal Analytics</h2>
          <GoalAnalytics goals={goals} />
        </div>
      )}
    </div>
  );
};
