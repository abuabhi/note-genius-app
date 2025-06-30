
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { UserTier } from '@/hooks/useRequireAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionHealthDashboard } from '@/components/admin/monitoring/ProductionHealthDashboard';
import { AdvancedCacheManager } from '@/components/performance/AdvancedCacheManager';
import { SystemAlertsManager } from '@/components/admin/monitoring/SystemAlertsManager';
import { LoadTestingDashboard } from '@/components/admin/monitoring/LoadTestingDashboard';
import { EdgeFunctionMonitor } from '@/components/admin/monitoring/EdgeFunctionMonitor';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Monitor } from 'lucide-react';

const AdminSystemMonitoringPage = () => {
  const { user, userProfile } = useRequireAuth();

  if (!user || userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
          <div className="container mx-auto p-6">
            <Card>
              <CardHeader>
                <CardTitle>Access Denied</CardTitle>
                <CardDescription>
                  You need Dean-tier access to view system monitoring tools.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "System Monitoring" }
  ];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="System Monitoring"
          description="Monitor system health, performance metrics, load testing, and comprehensive system analytics"
          icon={<Monitor className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />

        <div className="container mx-auto px-6 py-8">
          <Tabs defaultValue="health" className="space-y-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="health">Health Status</TabsTrigger>
              <TabsTrigger value="load-testing">Load Testing</TabsTrigger>
              <TabsTrigger value="edge-functions">Edge Functions</TabsTrigger>
              <TabsTrigger value="cache">Cache Management</TabsTrigger>
              <TabsTrigger value="alerts">Alerts</TabsTrigger>
            </TabsList>

            <TabsContent value="health" className="space-y-4">
              <ProductionHealthDashboard />
            </TabsContent>

            <TabsContent value="load-testing" className="space-y-4">
              <LoadTestingDashboard />
            </TabsContent>

            <TabsContent value="edge-functions" className="space-y-4">
              <EdgeFunctionMonitor />
            </TabsContent>

            <TabsContent value="cache" className="space-y-4">
              <AdvancedCacheManager />
            </TabsContent>

            <TabsContent value="alerts" className="space-y-4">
              <SystemAlertsManager />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default AdminSystemMonitoringPage;
