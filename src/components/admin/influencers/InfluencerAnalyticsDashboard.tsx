import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { InfluencerKPICards } from './InfluencerKPICards';
import { TopPerformersSection } from './TopPerformersSection';
import { PayoutSummarySection } from './PayoutSummarySection';
import { useInfluencerRevenueBreakdown } from '@/hooks/admin/useInfluencerRevenueBreakdown';
import { TrendingUp, Users, DollarSign, Award, Ticket, Loader } from 'lucide-react';

export const InfluencerAnalyticsDashboard = () => {
  const { data: revenueBreakdown, isLoading: isLoadingRevenue } = useInfluencerRevenueBreakdown();

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
                {isLoadingRevenue ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader className="h-6 w-6 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {revenueBreakdown?.map((tier, index) => (
                      <div key={tier.tier}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{tier.tier} Tier</span>
                          <span className="text-sm text-muted-foreground">
                            ${tier.totalRevenue.toLocaleString()} ({Math.round(tier.percentage)}%)
                          </span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-blue-500'}`}
                            style={{ width: `${tier.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                    {(!revenueBreakdown || revenueBreakdown.length === 0) && (
                      <div className="text-center py-4 text-muted-foreground">
                        No revenue data available yet
                      </div>
                    )}
                  </div>
                )}
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