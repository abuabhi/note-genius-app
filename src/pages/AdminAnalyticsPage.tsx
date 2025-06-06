
import React from "react";
import Layout from "@/components/layout/Layout";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { UserTier } from "@/hooks/useRequireAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AnalyticsDashboard } from "@/components/admin/analytics/AnalyticsDashboard";

const AdminAnalyticsPage = () => {
  const { user, userTier } = useRequireAuth([UserTier.DEAN]);

  if (!user || userTier !== UserTier.DEAN) {
    return (
      <Layout>
        <div className="container mx-auto p-6">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You need Dean-tier access to view analytics and KPIs.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Analytics & KPIs</h1>
          <p className="text-muted-foreground">
            Monitor key performance indicators and business metrics
          </p>
        </div>
        <AnalyticsDashboard />
      </div>
    </Layout>
  );
};

export default AdminAnalyticsPage;
