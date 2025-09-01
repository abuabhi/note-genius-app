
import React from 'react';
import AdminLayout from '@/components/layout/AdminLayout';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { UserTier } from '@/hooks/useRequireAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductionHealthDashboard } from '@/components/admin/monitoring/ProductionHealthDashboard';
import { AdvancedCacheManager } from '@/components/performance/AdvancedCacheManager';
import { SystemAlertsManager } from '@/components/admin/monitoring/SystemAlertsManager';
import { LoadTestingDashboard } from '@/components/admin/monitoring/LoadTestingDashboard';
import { EdgeFunctionMonitor } from '@/components/admin/monitoring/EdgeFunctionMonitor';
import { SentryTestingDashboard } from '@/components/monitoring/SentryTestingDashboard';
import UptimeRobotDashboard from '@/components/admin/monitoring/UptimeRobotDashboard';
import { VisualUnitTestingDashboard } from '@/components/admin/monitoring/VisualUnitTestingDashboard';
import { SecurityAuditDashboard } from '@/components/admin/security/SecurityAuditDashboard';
import { AccessControlHardening } from '@/components/admin/security/AccessControlHardening';
import { StandardPageHeader } from '@/components/ui/StandardPageHeader';
import { Monitor } from 'lucide-react';

const AdminSystemMonitoringPage = () => {
  const { user, userProfile } = useRequireAuth();

  if (!user || userProfile?.user_tier !== UserTier.DEAN) {
    return (
      <AdminLayout>
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
      </AdminLayout>
    );
  }

  const breadcrumbs = [
    { label: "Admin Dashboard", href: "/admin" },
    { label: "System Monitoring" }
  ];

  return (
    <AdminLayout>
      <StandardPageHeader
        title="System Monitoring"
        description="Monitor system health, performance metrics, load testing, and comprehensive system analytics"
        icon={<Monitor className="h-6 w-6 text-white" />}
        breadcrumbs={breadcrumbs}
      />

      <div className="container mx-auto px-6 py-8">
        <Tabs defaultValue="health" className="space-y-4">
          <TabsList className="grid w-full grid-cols-10">
            <TabsTrigger value="health">Health Status</TabsTrigger>
            <TabsTrigger value="uptime">Uptime</TabsTrigger>
            <TabsTrigger value="load-testing">Load Testing</TabsTrigger>
            <TabsTrigger value="unit-tests">Unit Tests</TabsTrigger>
            <TabsTrigger value="edge-functions">Edge Functions</TabsTrigger>
            <TabsTrigger value="cache">Cache Management</TabsTrigger>
            <TabsTrigger value="sentry">Sentry Testing</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="security-audit">Security Audit</TabsTrigger>
            <TabsTrigger value="access-control">Access Control</TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-4">
            <ProductionHealthDashboard />
          </TabsContent>

          <TabsContent value="uptime" className="space-y-4">
            <UptimeRobotDashboard />
          </TabsContent>

          <TabsContent value="load-testing" className="space-y-4">
            <LoadTestingDashboard />
          </TabsContent>

          <TabsContent value="unit-tests" className="space-y-4">
            <VisualUnitTestingDashboard />
          </TabsContent>

          <TabsContent value="edge-functions" className="space-y-4">
            <EdgeFunctionMonitor />
          </TabsContent>

          <TabsContent value="cache" className="space-y-4">
            <AdvancedCacheManager />
          </TabsContent>

          <TabsContent value="sentry" className="space-y-4">
            <SentryTestingDashboard />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-4">
            <SystemAlertsManager />
          </TabsContent>

          <TabsContent value="security-audit" className="space-y-4">
            <SecurityAuditDashboard />
          </TabsContent>

          <TabsContent value="access-control" className="space-y-4">
            <AccessControlHardening />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSystemMonitoringPage;
