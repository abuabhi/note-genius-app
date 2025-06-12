
import React from 'react';
import Layout from '@/components/layout/Layout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { UserTier } from '@/hooks/useRequireAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionHealthDashboard } from '@/components/admin/monitoring/ProductionHealthDashboard';
import { AdvancedCacheManager } from '@/components/performance/AdvancedCacheManager';
import { ProductionPerformanceMonitor } from '@/components/admin/monitoring/ProductionPerformanceMonitor';
import { SystemAlertsManager } from '@/components/admin/monitoring/SystemAlertsManager';

const AdminSystemMonitoringPage = () => {
  const { user, userProfile } = useRequireAuth();

  if (!user || userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <Layout>
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
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">System Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor system health, performance metrics, and cache management
          </p>
        </div>

        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="health">Health Status</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="cache">Cache Management</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            <ProductionHealthDashboard />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <ProductionPerformanceMonitor />
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <AdvancedCacheManager />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <SystemAlertsManager />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminSystemMonitoringPage;
