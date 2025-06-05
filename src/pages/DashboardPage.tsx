
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";
import { useFeatures } from "@/contexts/FeatureContext";
import { DashboardHeroSection } from "@/components/dashboard/DashboardHeroSection";
import { LearningAnalyticsDashboard } from "@/components/dashboard/LearningAnalyticsDashboard";
import { TodaysFocusSection } from "@/components/dashboard/TodaysFocusSection";
import { RecentActivityTimeline } from "@/components/dashboard/RecentActivityTimeline";
import { EnhancedQuickActionsGrid } from "@/components/dashboard/EnhancedQuickActionsGrid";

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
  
  // Use features with fallback
  let isFeatureVisible: (key: string) => boolean;
  
  try {
    const features = useFeatures();
    isFeatureVisible = features.isFeatureVisible;
    console.log('✅ Features context loaded successfully');
  } catch (error) {
    console.error('❌ Features context error in Dashboard, using fallbacks:', error);
    // Fallback: show core features, hide optional ones
    isFeatureVisible = (key: string) => {
      const coreFeatures = ['notes', 'flashcards', 'settings', 'quizzes'];
      return coreFeatures.includes(key);
    };
  }
  
  if (loading) {
    console.log('⏳ Dashboard is loading...');
    return (
      <Layout>
        <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    console.log("❌ Not authorized, redirecting via useRequireAuth");
    return null; // Will redirect via the useRequireAuth hook
  }

  console.log('✅ Dashboard rendering main content');
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-6 space-y-8">
          {/* Hero Section - Daily Overview */}
          <div>
            <DashboardHeroSection />
          </div>
          
          {/* Learning Analytics */}
          <div>
            <LearningAnalyticsDashboard />
          </div>
          
          {/* Two Column Layout for Focus and Activity */}
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Today's Focus - Goals, Reminders, ToDos */}
            <div>
              <TodaysFocusSection />
            </div>
            
            {/* Recent Activity Timeline */}
            <div>
              <RecentActivityTimeline />
            </div>
          </div>
          
          {/* Enhanced Quick Actions Grid */}
          <div>
            <EnhancedQuickActionsGrid />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
