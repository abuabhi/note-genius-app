
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { StudySessionList } from "@/components/study/StudySessionList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudyStatsOverview } from "@/components/study/StudyStatsOverview";
import { Calendar } from "lucide-react";

const StudySessionsPage = () => {
  const { user, loading } = useRequireAuth();
  const [activeTab, setActiveTab] = useState("all");

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

        <StudyStatsOverview />

        <div className="mb-6">
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 md:w-auto md:inline-flex">
              <TabsTrigger value="all">All Sessions</TabsTrigger>
              <TabsTrigger value="recent">Recent Sessions</TabsTrigger>
              <TabsTrigger value="archived">Archived Sessions</TabsTrigger>
            </TabsList>
            <TabsContent value="all">
              <StudySessionList filter="all" />
            </TabsContent>
            <TabsContent value="recent">
              <StudySessionList filter="recent" />
            </TabsContent>
            <TabsContent value="archived">
              <StudySessionList filter="archived" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default StudySessionsPage;
