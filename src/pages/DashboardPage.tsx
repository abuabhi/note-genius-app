
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, BookOpen, Settings, BarChart, GraduationCap, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { StudyStatsChart } from "@/components/progress/StudyStatsChart";
import { StudyStatsOverview } from "@/components/study/StudyStatsOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WelcomeBanner } from "@/components/dashboard/WelcomeBanner";

const DashboardPage = () => {
  const { user, userProfile, loading } = useRequireAuth();
  const isAuthorized = !!user;

  console.log("Dashboard rendering:", { user, isAuthorized, loading });

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6 flex items-center justify-center h-[50vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Loading your dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (!isAuthorized) {
    console.log("Not authorized, redirecting via useRequireAuth");
    return null; // Will redirect via the useRequireAuth hook
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <WelcomeBanner />
        
        {/* Analytics Tabs */}
        <div className="mb-8">
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Stats</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <StudyStatsOverview />
            </TabsContent>
            
            <TabsContent value="detailed">
              <StudyStatsChart />
            </TabsContent>
          </Tabs>
        </div>

        {/* Quick actions section */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-mint-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Quick Start</CardTitle>
              <CardDescription>Begin a new study session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/study-sessions">
                  <Clock className="mr-2 h-4 w-4" />
                  Start Studying
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-mint-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">My Notes</CardTitle>
              <CardDescription>Access your study materials</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/notes">
                  <FileText className="mr-2 h-4 w-4" />
                  View Notes
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-mint-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Schedule</CardTitle>
              <CardDescription>Manage your study calendar</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/schedule">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Schedule
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-mint-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Settings</CardTitle>
              <CardDescription>Manage your preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  View Settings
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default DashboardPage;
