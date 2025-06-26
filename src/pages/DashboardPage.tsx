
import Layout from "@/components/layout/Layout";
import { DashboardHeroSection } from "@/components/dashboard/DashboardHeroSection";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { TodaysFocusSection } from "@/components/dashboard/TodaysFocusSection";
import { EnhancedTopicSuggestionsSection } from "@/components/dashboard/EnhancedTopicSuggestionsSection";

const DashboardPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        <DashboardHeroSection />
        <TodaysFocusSection />
        <QuickActionsGrid isFeatureVisible={() => true} />
        <EnhancedTopicSuggestionsSection />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentActivityFeed />
          <AnalyticsSection />
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
