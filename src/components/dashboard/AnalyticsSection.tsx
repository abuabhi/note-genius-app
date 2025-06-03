
import { Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Lazy load components with proper error boundaries
const StudyStatsChart = () => {
  try {
    const { StudyStatsChart: Chart } = require("@/components/progress/StudyStatsChart");
    return <Chart />;
  } catch (error) {
    console.error('StudyStatsChart failed to load:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Statistics temporarily unavailable</p>
        </CardContent>
      </Card>
    );
  }
};

const StudyStatsOverview = () => {
  try {
    const { StudyStatsOverview: Overview } = require("@/components/study/StudyStatsOverview");
    return <Overview />;
  } catch (error) {
    console.error('StudyStatsOverview failed to load:', error);
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-muted-foreground">Overview temporarily unavailable</p>
        </CardContent>
      </Card>
    );
  }
};

export const AnalyticsSection = () => {
  return (
    <div className="mb-8">
      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <Suspense fallback={
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading overview...</span>
                </div>
              </CardContent>
            </Card>
          }>
            <StudyStatsOverview />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="detailed">
          <Suspense fallback={
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading detailed stats...</span>
                </div>
              </CardContent>
            </Card>
          }>
            <StudyStatsChart />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};
