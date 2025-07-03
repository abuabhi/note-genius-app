import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ticket, TrendingUp, Users, DollarSign } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const CouponStatsCards = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['coupon-stats'],
    queryFn: async () => {
      // Get coupon counts
      const { data: allCoupons } = await supabase
        .from('influencer_coupons')
        .select('*');

      const activeCoupons = allCoupons?.filter(c => 
        c.is_active && 
        (!c.expires_at || new Date(c.expires_at) > new Date()) &&
        (!c.usage_limit || c.current_usage < c.usage_limit)
      ).length || 0;

      const totalCoupons = allCoupons?.length || 0;

      // Get usage stats
      const { data: orders } = await supabase
        .from('influencer_orders')
        .select('*');

      const totalOrders = orders?.length || 0;
      const totalRevenue = orders?.reduce((sum, order) => sum + (order.order_amount || 0), 0) || 0;
      const totalDiscounts = orders?.reduce((sum, order) => sum + (order.discount_amount || 0), 0) || 0;

      return {
        activeCoupons,
        totalCoupons,
        totalOrders,
        totalRevenue,
        totalDiscounts,
      };
    },
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Coupons</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.activeCoupons || 0}</div>
          <p className="text-xs text-muted-foreground">
            of {stats?.totalCoupons || 0} total coupons
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats?.totalOrders || 0}</div>
          <p className="text-xs text-muted-foreground">
            Orders using coupons
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.totalRevenue || 0)}</div>
          <p className="text-xs text-muted-foreground">
            Total order value
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(stats?.totalDiscounts || 0)}</div>
          <p className="text-xs text-muted-foreground">
            Customer savings
          </p>
        </CardContent>
      </Card>
    </div>
  );
};