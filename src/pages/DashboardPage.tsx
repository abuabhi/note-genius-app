
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, BookOpen, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { Loader2 } from "lucide-react";

const DashboardPage = () => {
  const { isAuthorized, loading, user } = useRequireAuth();

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
