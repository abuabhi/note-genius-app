import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { StudySessionList } from "@/components/study/StudySessionList";
import { StudySessionsBreadcrumb } from "@/components/study/StudySessionsBreadcrumb";
import { StudyAnalyticsDashboard } from "@/components/study/StudyAnalyticsDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, History, Archive, BarChart3, Brain } from "lucide-react";
import { useEnhancedStudySessions } from "@/hooks/useEnhancedStudySessions";
import { useConsolidatedAnalytics } from "@/hooks/useConsolidatedAnalytics";
import { useSessionCleanup } from "@/hooks/useSessionCleanup";

const StudySessionsPage = () => {
  const { user, loading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("analytics");
  const { getFilteredSessions, isLoading } = useEnhancedStudySessions();
  const { analytics } = useConsolidatedAnalytics();
  
  // Clean up orphaned sessions on component mount
  useSessionCleanup();

  const getTabSessions = (tab: string) => {
    switch(tab) {
      case 'recent':
        return getFilteredSessions('recent');
      case 'archived':
        return getFilteredSessions('archived');
      case 'all':
      default:
        return getFilteredSessions('all');
    }
  };

  const currentSessions = getTabSessions(activeTab === 'analytics' ? 'all' : activeTab);

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
            <StudySessionsBreadcrumb 
              activeFilter={activeTab}
            />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4">
              <div>
                <h1 className="text-3xl font-bold text-mint-900 mb-2">Study Sessions</h1>
                <div className="flex items-center text-mint-600">
                  <Brain className="mr-2 h-5 w-5" />
                  <span className="text-sm">
                    Intelligent learning analytics and session tracking
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="bg-mint-100 p-3 rounded-lg">
                    <History className="h-6 w-6 text-mint-600 mx-auto" />
                  </div>
                  <div className="mt-2">
                    <div className="text-lg font-semibold text-mint-800">
                      {analytics.totalSessions}
                    </div>
                    <div className="text-xs text-mint-600">Total Sessions</div>
                  </div>
                </div>
                
                <div className="text-center">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <BarChart3 className="h-6 w-6 text-blue-600 mx-auto" />
                  </div>
                  <div className="mt-2">
                    <div className="text-lg font-semibold text-blue-800">
                      {Math.round(analytics.totalStudyTimeMinutes / 60 * 10) / 10}h
                    </div>
                    <div className="text-xs text-blue-600">Total Time</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Sessions Content */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <Tabs defaultValue="analytics" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:w-auto md:inline-flex bg-mint-50 border border-mint-200">
                <TabsTrigger 
                  value="analytics" 
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  All Sessions
                </TabsTrigger>
                <TabsTrigger 
                  value="recent"
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  Recent Sessions
                </TabsTrigger>
                <TabsTrigger 
                  value="archived"
                  className="data-[state=active]:bg-mint-500 data-[state=active]:text-white"
                >
                  <Archive className="h-4 w-4 mr-2" />
                  Archived
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="analytics" className="mt-6">
                <StudyAnalyticsDashboard />
              </TabsContent>
              
              <TabsContent value="all" className="mt-6">
                <StudySessionList sessions={currentSessions} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="recent" className="mt-6">
                <StudySessionList sessions={currentSessions} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="archived" className="mt-6">
                <StudySessionList sessions={currentSessions} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudySessionsPage;
