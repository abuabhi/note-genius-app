
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { StudySessionList } from "@/components/study/StudySessionList";
import { StudySessionsBreadcrumb } from "@/components/study/StudySessionsBreadcrumb";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudyStatsOverview } from "@/components/study/StudyStatsOverview";
import { Calendar, TrendingUp } from "lucide-react";
import { useStudySessions } from "@/hooks/useStudySessions";
import { FeatureDisabledAlert } from "@/components/routes/FeatureProtectedRoute";

const StudySessionsPage = () => {
  const { user, loading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("all");
  const { sessions, isLoading } = useStudySessions();

  // Filter sessions based on the active tab
  const getFilteredSessions = () => {
    if (!sessions) return [];
    
    switch(activeTab) {
      case 'recent':
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return sessions.filter(s => new Date(s.start_time) >= oneWeekAgo);
      case 'archived':
        return sessions.filter(s => !s.is_active);
      case 'all':
      default:
        return sessions;
    }
  };

  const filteredSessions = getFilteredSessions();

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
    // Will redirect via useRequireAuth
    return null;
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50 via-white to-mint-100/30">
        <div className="container mx-auto p-4 md:p-6 space-y-8">
          {/* Header Section with Glass Morphism */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <StudySessionsBreadcrumb 
              activeFilter={activeTab} 
              sessionCount={filteredSessions.length} 
            />
            
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4">
              <div>
                <h1 className="text-3xl font-bold text-mint-900 mb-2">Study Sessions</h1>
                <div className="flex items-center text-mint-600">
                  <Calendar className="mr-2 h-5 w-5" />
                  <span className="text-sm">
                    Track and review your study sessions
                  </span>
                </div>
              </div>
              
              <div className="mt-4 md:mt-0 flex items-center gap-2">
                <div className="bg-mint-100 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-mint-600" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold text-mint-800">
                    {sessions?.length || 0}
                  </div>
                  <div className="text-xs text-mint-600">Total Sessions</div>
                </div>
              </div>
            </div>
          </div>

          <FeatureDisabledAlert featureKey="study_sessions" featureDisplayName="Study Sessions" />

          {/* Stats Overview */}
          <StudyStatsOverview />

          {/* Sessions Content */}
          <div className="bg-white/60 backdrop-blur-sm rounded-xl border border-mint-100 p-6 shadow-lg">
            <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex bg-mint-50 border border-mint-200">
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
                  Archived Sessions
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                <StudySessionList sessions={filteredSessions} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="recent" className="mt-6">
                <StudySessionList sessions={filteredSessions} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="archived" className="mt-6">
                <StudySessionList sessions={filteredSessions} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default StudySessionsPage;
