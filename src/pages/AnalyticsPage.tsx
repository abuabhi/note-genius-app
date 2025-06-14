
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";
import { BarChart3, TrendingUp, History, Award, Brain } from "lucide-react";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { SessionHistory } from "@/components/analytics/SessionHistory";
import { DetailedAnalytics } from "@/components/analytics/DetailedAnalytics";
import { Achievements } from "@/components/progress/Achievements";

const AnalyticsPage = () => {
  const { user, loading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("overview");

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-mint-100/30">
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex items-center justify-center h-[80vh]">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-mint-100/30">
        <div className="container mx-auto p-4 md:p-6 space-y-8">
          {/* Header Section */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <PageBreadcrumb pageName="Analytics" pageIcon={<BarChart3 className="h-3 w-3" />} />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4">
              <div>
                <h1 className="text-3xl font-bold text-mint-900 mb-2">Learning Analytics</h1>
                <div className="flex items-center text-mint-600">
                  <Brain className="mr-2 h-5 w-5" />
                  <span className="text-sm">
                    Track your progress, sessions, and achievements in one place
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Content */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex bg-mint-50 border border-mint-200">
                <TabsTrigger 
                  value="overview" 
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="sessions"
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <History className="h-4 w-4 mr-2" />
                  Sessions
                </TabsTrigger>
                <TabsTrigger 
                  value="analytics"
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements"
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <Award className="h-4 w-4 mr-2" />
                  Achievements
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <AnalyticsOverview />
              </TabsContent>
              
              <TabsContent value="sessions" className="mt-6">
                <SessionHistory />
              </TabsContent>
              
              <TabsContent value="analytics" className="mt-6">
                <DetailedAnalytics />
              </TabsContent>
              
              <TabsContent value="achievements" className="mt-6">
                <Achievements />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AnalyticsPage;
