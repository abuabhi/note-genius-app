
import Layout from "@/components/layout/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, FileText, BookOpen, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Welcome back!</h1>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
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

          <Card>
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

          <Card>
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

          <Card>
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
