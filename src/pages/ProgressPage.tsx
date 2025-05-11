
import { useState } from "react";
import Layout from "@/components/layout/Layout";
import ProgressOverview from "@/components/progress/ProgressOverview";
import { StudyStatsChart } from "@/components/progress/StudyStatsChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Achievements } from "@/components/progress/Achievements";
import { FeatureDisabledAlert } from "@/components/routes/FeatureProtectedRoute";

const ProgressPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-2">Progress Tracking</h1>
        <p className="text-muted-foreground mb-6">
          Track your learning progress and achievements
        </p>
        
        <FeatureDisabledAlert featureKey="progress" featureDisplayName="Progress Tracking" />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="stats">Detailed Stats</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="mt-6">
            <ProgressOverview />
          </TabsContent>
          
          <TabsContent value="stats" className="mt-6">
            <StudyStatsChart />
          </TabsContent>
          
          <TabsContent value="achievements" className="mt-6">
            <Achievements />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default ProgressPage;
