
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Users, UserPlus, Activity, TrendingDown } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface DateRange {
  start: Date;
  end: Date;
}

interface UserMetricsProps {
  dateRange: DateRange;
}

export const UserMetrics = ({ dateRange }: UserMetricsProps) => {
  const { data: userMetrics, isLoading } = useQuery({
    queryKey: ['user-metrics', dateRange],
    queryFn: async () => {
      // Get DAU and MAU
      const { data: dau, error: dauError } = await supabase.rpc('calculate_dau');
      const { data: mau, error: mauError } = await supabase.rpc('calculate_mau');
      
      // Get total users
      const { data: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' });

      // Get new signups in date range
      const { data: newSignups, error: signupsError } = await supabase
        .from('profiles')
        .select('id', { count: 'exact' })
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());

      if (dauError || mauError || usersError || signupsError) {
        console.error('User metrics error:', { dauError, mauError, usersError, signupsError });
        throw new Error('Failed to fetch user metrics');
      }

      // Mock retention data
      const retentionData = [
        { day: 'Day 1', retention: 85 },
        { day: 'Day 7', retention: 65 },
        { day: 'Day 14', retention: 45 },
        { day: 'Day 30', retention: 30 }
      ];

      // Mock tier distribution
      const { data: tierDistribution } = await supabase
        .from('profiles')
        .select('user_tier')
        .not('user_tier', 'is', null);

      const tierCounts = tierDistribution?.reduce((acc: any, profile: any) => {
        acc[profile.user_tier] = (acc[profile.user_tier] || 0) + 1;
        return acc;
      }, {}) || {};

      const tierData = Object.entries(tierCounts).map(([tier, count]) => ({
        tier,
        count: count as number
      }));

      return {
        dau: dau || 0,
        mau: mau || 0,
        totalUsers: totalUsers?.length || 0,
        newSignups: newSignups?.length || 0,
        retentionData,
        tierData
      };
    }
  });

  if (isLoading) {
    return <div>Loading user metrics...</div>;
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics?.totalUsers || 0}</div>
            <p className="text-xs text-muted-foreground">All registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DAU</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics?.dau || 0}</div>
            <p className="text-xs text-muted-foreground">Daily active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MAU</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics?.mau || 0}</div>
            <p className="text-xs text-muted-foreground">Monthly active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Signups</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userMetrics?.newSignups || 0}</div>
            <p className="text-xs text-muted-foreground">In selected period</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>User Retention</CardTitle>
            <CardDescription>Percentage of users retained over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userMetrics?.retentionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip formatter={(value) => `${value}%`} />
                <Line type="monotone" dataKey="retention" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Tier Distribution</CardTitle>
            <CardDescription>Distribution of users by tier</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={userMetrics?.tierData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ tier, percent }) => `${tier} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {userMetrics?.tierData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
