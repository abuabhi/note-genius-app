
import { useState, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { StudySessionList } from "@/components/study/StudySessionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudyStatsOverview } from "@/components/study/StudyStatsOverview";
import { Calendar } from "lucide-react";
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

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-4 md:p-6">
          <div className="flex items-center justify-center h-[80vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
      <div className="container mx-auto p-4 md:p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">Study Sessions</h1>
          <div className="flex items-center mt-2 md:mt-0">
            <Calendar className="mr-2 h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Track and review your study sessions
            </span>
          </div>
        </div>

        <FeatureDisabledAlert featureKey="study_sessions" featureDisplayName="Study Sessions" />

        <StudyStatsOverview />

        <div className="mb-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
              <TabsTrigger value="all">All Sessions</TabsTrigger>
              <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
              <TabsTrigger value="archived">Archived Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <StudySessionList sessions={getFilteredSessions()} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="recent">
              <StudySessionList sessions={getFilteredSessions()} isLoading={isLoading} />
            </TabsContent>
            <TabsContent value="archived">
              <StudySessionList sessions={getFilteredSessions()} isLoading={isLoading} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default StudySessionsPage;
