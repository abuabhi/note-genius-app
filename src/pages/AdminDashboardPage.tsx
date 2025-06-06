
import React from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth, UserTier } from "@/hooks/useRequireAuth";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader, ShieldAlert, Users, Upload, Database, BookOpen, Settings, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { PageBreadcrumb } from "@/components/ui/page-breadcrumb";

const AdminDashboardPage = () => {
  const { userProfile, loading } = useRequireAuth();
  
  // Check if user is admin (DEAN tier)
  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <div className="flex flex-col justify-center items-center h-64">
            <Loader className="h-8 w-8 animate-spin mb-4" />
            <span className="text-muted-foreground">Loading user profile...</span>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Alert variant="destructive">
            <ShieldAlert className="h-4 w-4" />
            <AlertDescription>
              You don't have permission to access this page.
            </AlertDescription>
          </Alert>
        </div>
      </Layout>
    );
  }

  const adminSections = [
    {
      title: "User Management",
      description: "Manage user accounts, tiers, and permissions",
      icon: Users,
      href: "/admin/users",
      color: "bg-blue-500"
    },
    {
      title: "CSV Import",
      description: "Bulk import data from CSV files",
      icon: Upload,
      href: "/admin/csv-import",
      color: "bg-green-500"
    },
    {
      title: "Grades Management",
      description: "Manage grade levels and academic years",
      icon: Database,
      href: "/admin/grades",
      color: "bg-purple-500"
    },
    {
      title: "Subjects Management",
      description: "Manage subjects and curriculum",
      icon: BookOpen,
      href: "/admin/subjects",
      color: "bg-orange-500"
    },
    {
      title: "Sections Management",
      description: "Manage course sections and topics",
      icon: Settings,
      href: "/admin/sections",
      color: "bg-indigo-500"
    },
    {
      title: "Feature Management",
      description: "Manage application features and toggles",
      icon: Shield,
      href: "/admin/features",
      color: "bg-red-500"
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <PageBreadcrumb pageName="Administration" pageIcon={<Shield className="h-4 w-4" />} />
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Administration Dashboard</h1>
          <p className="text-muted-foreground">
            Manage users, content, and system settings from this central hub.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminSections.map((section) => {
            const IconComponent = section.icon;
            return (
              <Card key={section.href} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${section.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{section.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {section.description}
                  </CardDescription>
                  <Button asChild className="w-full">
                    <Link to={section.href}>
                      Access {section.title}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboardPage;
