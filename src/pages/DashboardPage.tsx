
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";
import { StudySuggestions } from "@/components/analytics/StudySuggestions";
import { LearningAnalyticsDashboard } from "@/components/dashboard/LearningAnalyticsDashboard";
import { TodosSection } from "@/components/dashboard/TodosSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { StudyPlannerSection } from "@/components/dashboard/StudyPlannerSection";
import { ReferralSignupHandler } from "@/components/referrals/ReferralSignupHandler";
import { ReferralSignupErrorBoundary } from "@/components/referrals/ReferralSignupErrorBoundary";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";
import { LearningToolkitSection } from "@/components/dashboard/LearningToolkitSection";
import { ReminderDebugPanel } from "@/components/debug/ReminderDebugPanel";

const DashboardPage = () => {
  console.log('🏠 DashboardPage component rendering');
  
  const {
    user,
    userProfile,
    loading
  } = useRequireAuth();
  
  const { analytics, isLoading: analyticsLoading } = useUltraSimpleAnalytics();
  
  // Transform analytics data to match what StudySuggestions expects
  const subjectAnalytics = {
    subjects: analytics ? [
      // Create mock subject data from analytics
      {
        name: 'General Studies',
        completionPercentage: Math.min(100, (analytics.totalStudyTimeMinutes / 60) * 10), // Rough completion estimate
        last7DaysTime: analytics.weeklyStudyTimeMinutes,
        totalTime: analytics.totalStudyTimeMinutes
      }
    ] : []
  };
  
  console.log('👤 Dashboard auth state:', {
    user: user?.id,
    userProfile: userProfile?.id,
    loading
  });
  
  if (loading) {
    console.log('⏳ Dashboard is loading...');
    return (
      <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }
  
  if (!user) {
    console.log("❌ Not authorized, redirecting via useRequireAuth");
    return null; // Will redirect via the useRequireAuth hook
  }

  console.log('✅ Dashboard rendering main content');
  
  return (
    <>
      <ReferralSignupErrorBoundary>
        <ReferralSignupHandler />
      </ReferralSignupErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-6 space-y-8">
          {/* Welcome Banner - Enhanced gradient */}
          <WelcomeBanner />
          
          {/* TEMPORARY: Reminder System Setup Panel */}
          <div className="bg-orange-50 border-l-4 border-orange-400 p-4 rounded-lg">
            <div className="flex items-center mb-2">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">
                  Temporary Reminder System Access
                </h3>
                <p className="text-sm text-orange-700 mt-1">
                  This panel is temporarily here so you can activate reminder processing. Once setup is complete, this will be removed from the dashboard.
                </p>
              </div>
            </div>
          </div>
          
          <ReminderDebugPanel />
          
          {/* AI Study Suggestions - With fixed percentage formatting */}
          <StudySuggestions subjectAnalytics={subjectAnalytics} />
          
          {/* Learning Toolkit - New optimized section */}
          <LearningToolkitSection />
          
          {/* Simplified Analytics - Essential metrics only */}
          <div>
            <LearningAnalyticsDashboard />
          </div>
          
          {/* 3-Column Grid Layout: Study Plans | Goals | Todos */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div>
              <StudyPlannerSection />
            </div>
            <div>
              <GoalsSection />
            </div>
            <div>
              <TodosSection />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
