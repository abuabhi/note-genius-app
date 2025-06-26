import Layout from "@/components/layout/Layout";
import { DashboardHeroSection } from "@/components/dashboard/DashboardHeroSection";
import { QuickActionsGrid } from "@/components/dashboard/QuickActionsGrid";
import RecentActivityFeed from "@/components/dashboard/RecentActivityFeed";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";
import { TodaysFocusSection } from "@/components/dashboard/TodaysFocusSection";
import { EnhancedTopicSuggestionsSection } from "@/components/dashboard/EnhancedTopicSuggestionsSection";
import { AdvancedAnalyticsDashboard } from "@/components/analytics/AdvancedAnalyticsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const DashboardPage = () => {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-6 space-y-8">
        <DashboardHeroSection />
        <TodaysFocusSection />
        <QuickActionsGrid isFeatureVisible={() => true} />
        <EnhancedTopicSuggestionsSection />
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Analytics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <RecentActivityFeed />
              <AnalyticsSection />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <AdvancedAnalyticsDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default DashboardPage;
