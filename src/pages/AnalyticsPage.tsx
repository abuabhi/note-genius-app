
import { useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, TrendingUp, History, Brain, Target } from "lucide-react";
import { AnalyticsOverview } from "@/components/analytics/AnalyticsOverview";
import { SessionHistory } from "@/components/analytics/SessionHistory";
import { Achievements } from "@/components/progress/Achievements";
import { SubjectProgressDashboard } from "@/components/analytics/SubjectProgressDashboard";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";

const AnalyticsPage = () => {
  const { user, loading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("subjects");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="relative w-12 h-12">
              <div className="absolute inset-0 border-4 border-mint-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-mint-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const breadcrumbs = [
    { label: "Analytics" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
      <StandardPageHeader
        title="Learning Analytics"
        description="Track your progress, sessions, and achievements"
        icon={<BarChart3 className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />
      
      <div className="container mx-auto px-6 py-8">
        {/* Analytics Content */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
          <Tabs defaultValue="subjects" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex bg-mint-50 border border-mint-200">
              <TabsTrigger 
                value="subjects" 
                className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
              >
                <Target className="h-4 w-4 mr-2" />
                Subject Analytics
              </TabsTrigger>
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
                value="achievements"
                className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Achievements
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="subjects" className="mt-6">
              <SubjectProgressDashboard />
            </TabsContent>
            
            <TabsContent value="overview" className="mt-6">
              <AnalyticsOverview />
            </TabsContent>
            
            <TabsContent value="sessions" className="mt-6">
              <SessionHistory />
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-6">
              <Achievements />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;
