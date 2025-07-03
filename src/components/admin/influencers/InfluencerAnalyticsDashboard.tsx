import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { InfluencerKPICards } from './InfluencerKPICards';
import { TopPerformersSection } from './TopPerformersSection';
import { PayoutSummarySection } from './PayoutSummarySection';
import { TrendingUp, Users, DollarSign, Award, Ticket } from 'lucide-react';

export const InfluencerAnalyticsDashboard = () => {
  return (
    <div className="space-y-6">
      {/* KPI Overview */}
      <InfluencerKPICards />

      {/* Detailed Analytics */}
      <Tabs defaultValue="performance" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="coupons">Coupons</TabsTrigger>
          <TabsTrigger value="payouts">Payouts</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopPerformersSection />
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Revenue Breakdown
                </CardTitle>
                <CardDescription>
                  Revenue attribution by influencer tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">MASTER Tier</span>
                    <span className="text-sm text-muted-foreground">$12,450 (65%)</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '65%' }}></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">GRADUATE Tier</span>
                    <span className="text-sm text-muted-foreground">$6,780 (35%)</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coupons" className="space-y-4">
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Coupon management is now available in a dedicated section.
            </p>
            <Button asChild>
              <a href="/admin/coupons">
                <Ticket className="h-4 w-4 mr-2" />
                Manage Coupons
              </a>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="payouts" className="space-y-4">
          <PayoutSummarySection />
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Trends</CardTitle>
              <CardDescription>
                Coupon usage and conversion trends over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Trend charts coming soon...
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  Bulk Extend Influencers
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  Send Performance Reports
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  Review Pending Applications
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Financial
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  Process Pending Payouts
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  Generate Financial Report
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  Adjust Commission Rates
                </button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  Promote Top Performers
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  Review Underperformers
                </button>
                <button className="w-full text-left px-3 py-2 rounded-md hover:bg-secondary transition-colors">
                  Set Performance Goals
                </button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};