import React from 'react';
import { UserProgressState } from '@/hooks/useUserProgressState';
import { EnhancedDashboardHeroSection } from '../EnhancedDashboardHeroSection';
import { LearningToolkitSection } from '../LearningToolkitSection';
import { StudySuggestions } from '@/components/analytics/StudySuggestions';
import { StudyPlannerSection } from '../StudyPlannerSection';
import { GoalsSection } from '../GoalsSection';
import { TodosSection } from '../TodosSection';
import { EnhancedQuickActionsGrid } from '../EnhancedQuickActionsGrid';
import { useDashboardAnalytics } from '@/hooks/useDashboardAnalytics';
import { OnboardingChecklist } from './OnboardingChecklist';

interface IntermediateDashboardProps {
  progressState: UserProgressState;
}

export const IntermediateDashboard = ({ progressState }: IntermediateDashboardProps) => {
  const analytics = useDashboardAnalytics();

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section with Study Session Prompts */}
        <EnhancedDashboardHeroSection />
        
        {/* Onboarding Checklist - Full Width Horizontal Section */}
        <OnboardingChecklist />
        
        {/* AI Study Suggestions - Full Width */}
        <StudySuggestions subjectAnalytics={analytics} />
        
        {/* Learning Toolkit Section */}
        <LearningToolkitSection />
        
        {/* Three-Panel Study Section: Study Plans, Goals, and Todos */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your Study Dashboard</h2>
            <p className="text-gray-600">Continue building your learning routine</p>
          </div>
          
          <div className="grid gap-6 lg:grid-cols-3 md:grid-cols-2 grid-cols-1">
            <StudyPlannerSection />
            <GoalsSection />
            <TodosSection />
          </div>
        </div>
        
        {/* Quick Actions Grid */}
        <EnhancedQuickActionsGrid />
      </div>
    </div>
  );
};