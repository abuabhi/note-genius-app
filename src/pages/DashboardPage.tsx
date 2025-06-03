
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, BookOpen, Settings, BarChart, GraduationCap, Shield, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFeatures } from "@/contexts/FeatureContext";
import { Suspense } from "react";

// Lazy load components with proper error boundaries
const StudyStatsChart = () => {
  try {
    const { StudyStatsChart: Chart } = require("@/components/progress/StudyStatsChart");
    return <Chart />;
  } catch (error) {
    console.error('StudyStatsChart failed to load:', error);
    return (
      <Card>
        <CardHeader>
          <CardTitle>Study Statistics</CardTitle>
        </CardHeader>
        <CardContent>
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
        <CardHeader>
          <CardTitle>Study Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Overview temporarily unavailable</p>
        </CardContent>
      </Card>
    );
  }
};

const WelcomeBanner = () => {
  try {
    const { WelcomeBanner: Banner } = require("@/components/dashboard/WelcomeBanner");
    return <Banner />;
  } catch (error) {
    console.error('WelcomeBanner failed to load:', error);
    return (
      <div className="mb-8 p-6 bg-gradient-to-r from-mint-50 to-mint-100 rounded-lg">
        <h1 className="text-2xl font-bold text-mint-900 mb-2">Welcome to StudyBuddy</h1>
        <p className="text-mint-700">Start your learning journey today!</p>
      </div>
    );
  }
};

const DashboardPage = () => {
  const {
    user,
    userProfile,
    loading
  } = useRequireAuth();
  
  // Use features with fallback
  let isFeatureVisible: (key: string) => boolean;
  
  try {
    const features = useFeatures();
    isFeatureVisible = features.isFeatureVisible;
  } catch (error) {
    console.error('Features context error in Dashboard, using fallbacks:', error);
    // Fallback: show core features, hide optional ones
    isFeatureVisible = (key: string) => {
      const coreFeatures = ['notes', 'flashcards', 'settings'];
      return coreFeatures.includes(key);
    };
  }
  
  console.log("Dashboard rendering:", {
    user,
    userProfile,
    loading
  });
  
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
  
  if (!user) {
    console.log("Not authorized, redirecting via useRequireAuth");
    return null; // Will redirect via the useRequireAuth hook
  }
  
  // Define feature keys for quick access
  const FEATURE_KEYS = {
    STUDY_SESSIONS: "study_sessions",
    SCHEDULE: "schedule",
    NOTES: "notes", // Core feature, always visible
    SETTINGS: "settings", // Core feature, always visible
  };
  
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <Suspense fallback={<div>Loading welcome banner...</div>}>
          <WelcomeBanner />
        </Suspense>
        
        {/* Analytics Tabs */}
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

        {/* Quick actions section */}
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Study Sessions Card - Only show if feature is visible */}
          {isFeatureVisible(FEATURE_KEYS.STUDY_SESSIONS) && (
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
          )}

          {/* Flashcards Card - Core feature, always visible */}
          <Card className="border-mint-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Flashcards</CardTitle>
              <CardDescription>Study with flashcards</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link to="/flashcards">
                  <BookOpen className="mr-2 h-4 w-4" />
                  View Flashcards
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Notes Card - Core functionality, always visible */}
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

          {/* Schedule Card - Only show if feature is visible */}
          {isFeatureVisible(FEATURE_KEYS.SCHEDULE) && (
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
          )}

          {/* Settings Card - Core functionality, always visible */}
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
