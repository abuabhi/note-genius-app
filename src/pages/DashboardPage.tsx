
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
