
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, BookOpen, Settings, BarChart, GraduationCap, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const DashboardPage = () => {
  const { isAuthorized, loading, user, profile, tierLimits } = useRequireAuth();

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
    return null; // Will redirect via the useRequireAuth hook
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-mint-700">
          Welcome back{user?.email ? `, ${user.email.split('@')[0]}!` : '!'}
        </h1>
        
        {/* User tier information */}
        {profile && tierLimits && (
          <Card className="mb-8 border-mint-100 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <GraduationCap className="h-6 w-6 text-mint-600" />
                    {profile.user_tier} Tier
                  </CardTitle>
                  <CardDescription>Your learning journey level</CardDescription>
                </div>
                {profile.user_tier !== 'DEAN' && (
                  <Button asChild variant="outline" size="sm">
                    <Link to="/pricing">Upgrade</Link>
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {/* Notes usage */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Notes</span>
                    <span className="text-xs text-muted-foreground">
                      {/* Handle notes count when we have access to it */}
                      0 / {tierLimits.max_notes}
                    </span>
                  </div>
                  <Progress value={0} max={100} className="h-2" />
                </div>
                
                {/* Storage usage */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Storage</span>
                    <span className="text-xs text-muted-foreground">
                      {/* Handle storage usage when we have access to it */}
                      0 MB / {tierLimits.max_storage_mb} MB
                    </span>
                  </div>
                  <Progress value={0} max={100} className="h-2" />
                </div>

                {/* Features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${tierLimits.ocr_enabled ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={`text-sm ${tierLimits.ocr_enabled ? 'text-gray-700' : 'text-gray-400'}`}>OCR Scanning</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${tierLimits.ai_features_enabled ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={`text-sm ${tierLimits.ai_features_enabled ? 'text-gray-700' : 'text-gray-400'}`}>AI Features</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${tierLimits.collaboration_enabled ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={`text-sm ${tierLimits.collaboration_enabled ? 'text-gray-700' : 'text-gray-400'}`}>Collaboration</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className={`h-4 w-4 ${tierLimits.priority_support ? 'text-green-500' : 'text-gray-300'}`} />
                    <span className={`text-sm ${tierLimits.priority_support ? 'text-gray-700' : 'text-gray-400'}`}>Priority Support</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Quick actions section */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-mint-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl">Quick Start</CardTitle>
              <CardDescription>Begin a new study session</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link to="/study/new">
                  <BookOpen className="mr-2 h-4 w-4" />
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
                  Open Settings
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
