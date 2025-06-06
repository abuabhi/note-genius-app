
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, TrendingUp, Users, Target } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface DateRange {
  start: Date;
  end: Date;
}

interface RevenueMetricsProps {
  dateRange: DateRange;
}

export const RevenueMetrics = ({ dateRange }: RevenueMetricsProps) => {
  const { data: revenueData, isLoading } = useQuery({
    queryKey: ['revenue-metrics', dateRange],
    queryFn: async () => {
      const { data: mrr, error: mrrError } = await supabase.rpc('calculate_mrr');
      const { data: arr, error: arrError } = await supabase.rpc('calculate_arr');
      const { data: churnRate, error: churnError } = await supabase.rpc('calculate_churn_rate');
      
      if (mrrError || arrError || churnError) {
        console.error('Revenue metrics error:', { mrrError, arrError, churnError });
        throw new Error('Failed to fetch revenue metrics');
      }

      // Mock historical data for charts
      const mockMrrHistory = Array.from({ length: 12 }, (_, i) => ({
        month: new Date(Date.now() - (11 - i) * 30 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short' }),
        mrr: Math.max(0, (mrr || 0) - Math.random() * 1000 + (i * 200))
      }));

      const mockPlanDistribution = [
        { plan: 'Basic', customers: 35, revenue: 35 * 9.99 },
        { plan: 'Premium', customers: 12, revenue: 12 * 19.99 },
        { plan: 'Enterprise', customers: 3, revenue: 3 * 49.99 }
      ];

      return {
        mrr: mrr || 0,
        arr: arr || 0,
        churnRate: churnRate || 0,
        mrrHistory: mockMrrHistory,
        planDistribution: mockPlanDistribution,
        // Mock CAC and LTV for demo
        cac: 45.67,
        ltv: 234.89,
        ltvCacRatio: 5.14
      };
    }
  });

  if (isLoading) {
    return <div>Loading revenue metrics...</div>;
  }

  const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueData?.mrr || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary">Mock Data</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(revenueData?.arr || 0)}</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary">Mock Data</Badge>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(revenueData?.churnRate || 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">LTV:CAC Ratio</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{revenueData?.ltvCacRatio.toFixed(1)}:1</div>
            <p className="text-xs text-muted-foreground">
              <Badge variant="secondary">Mock Data</Badge>
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>MRR Trend</CardTitle>
            <CardDescription>Monthly recurring revenue over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData?.mrrHistory}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Line type="monotone" dataKey="mrr" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by Plan</CardTitle>
            <CardDescription>Distribution of customers and revenue by plan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueData?.planDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip formatter={(value, name) => [
                  name === 'revenue' ? formatCurrency(Number(value)) : value,
                  name === 'revenue' ? 'Revenue' : 'Customers'
                ]} />
                <Bar dataKey="customers" fill="#8884d8" />
                <Bar dataKey="revenue" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
