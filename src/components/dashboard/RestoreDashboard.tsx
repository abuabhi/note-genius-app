
import React from 'react';
import { useAuth } from '@/contexts/auth';
import { EnhancedDashboardHeroSection } from './EnhancedDashboardHeroSection';
import { LearningToolkitSection } from './LearningToolkitSection';
import { TodaysFocusSection } from './TodaysFocusSection';
import { EnhancedQuickActionsGrid } from './EnhancedQuickActionsGrid';
import { LearningAnalyticsDashboard } from './LearningAnalyticsDashboard';

export const RestoreDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-mint-600"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via auth hooks
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Hero Section with Welcome and Study Session Prompts */}
        <EnhancedDashboardHeroSection />
        
        {/* Learning Toolkit Section */}
        <LearningToolkitSection />
        
        {/* Today's Focus Section (Goals, Todos, etc.) */}
        <TodaysFocusSection />
        
        {/* Quick Actions Grid */}
        <EnhancedQuickActionsGrid />
        
        {/* Learning Analytics Dashboard (AI Suggestions) */}
        <LearningAnalyticsDashboard />
      </div>
    </div>
  );
};
