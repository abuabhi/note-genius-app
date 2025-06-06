
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueMetrics } from "./RevenueMetrics";
import { UserMetrics } from "./UserMetrics";
import { EngagementMetrics } from "./EngagementMetrics";
import { KPIExport } from "./KPIExport";
import { DateRangeFilter } from "./DateRangeFilter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AnalyticsDashboard = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date()
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
        <KPIExport dateRange={dateRange} />
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="revenue">Revenue & Growth</TabsTrigger>
          <TabsTrigger value="users">User Metrics</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <RevenueMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserMetrics dateRange={dateRange} />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <EngagementMetrics dateRange={dateRange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
