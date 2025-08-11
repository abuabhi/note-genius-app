
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { CleanProgressOverview } from "@/components/progress/CleanProgressOverview";
import { AIInsightsTab } from "@/components/progress/AIInsightsTab";
import { DetailedStatsPlaceholder } from "@/components/progress/DetailedStatsPlaceholder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Achievements } from "@/components/progress/Achievements";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { BarChart3 } from "lucide-react";
import { Helmet } from 'react-helmet';

const ProgressPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const breadcrumbs = [
    { label: "Progress" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <Helmet>
          <meta name="robots" content="noindex,nofollow" />
        </Helmet>
        <StandardPageHeader
          title="Progress Tracking"
          description="Track your learning progress and achievements"
          icon={<BarChart3 className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
              <TabsTrigger value="detailed-stats">Detailed Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-6">
              <CleanProgressOverview />
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-6">
              <Achievements />
            </TabsContent>
            
            <TabsContent value="ai-insights" className="mt-6">
              <AIInsightsTab />
            </TabsContent>
            
            <TabsContent value="detailed-stats" className="mt-6">
              <DetailedStatsPlaceholder />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default ProgressPage;
