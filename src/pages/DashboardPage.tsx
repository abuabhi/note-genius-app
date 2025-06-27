
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";
import { DashboardHeroSection } from "@/components/dashboard/DashboardHeroSection";
import { LearningAnalyticsDashboard } from "@/components/dashboard/LearningAnalyticsDashboard";
import { TodosSection } from "@/components/dashboard/TodosSection";
import { GoalsSection } from "@/components/dashboard/GoalsSection";
import { StudyPlannerSection } from "@/components/dashboard/StudyPlannerSection";
import { ReferralSignupHandler } from "@/components/referrals/ReferralSignupHandler";
import { ReferralSignupErrorBoundary } from "@/components/referrals/ReferralSignupErrorBoundary";

const DashboardPage = () => {
  console.log('🏠 DashboardPage component rendering');
  
  const {
    user,
    userProfile,
    loading
  } = useRequireAuth();
  
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
          {/* Hero Section - Updated with complete user flow */}
          <div>
            <DashboardHeroSection />
          </div>
          
          {/* Study Planner Section - New */}
          <div>
            <StudyPlannerSection />
          </div>
          
          {/* Simplified Analytics - Essential metrics only */}
          <div>
            <LearningAnalyticsDashboard />
          </div>
          
          {/* Goals and Todos - More compact layout */}
          <div className="grid gap-6 lg:grid-cols-2">
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
