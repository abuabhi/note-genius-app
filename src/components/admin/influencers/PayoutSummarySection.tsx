import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, Calendar, User, AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface PayoutSummary {
  id: string;
  influencer_id: string;
  username: string;
  total_commission: number;
  period_start: string;
  period_end: string;
  status: string;
  created_at: string;
}

export const PayoutSummarySection = () => {
  const { data: payouts, isLoading } = useQuery({
    queryKey: ['influencer-payouts'],
    queryFn: async (): Promise<PayoutSummary[]> => {
      const { data } = await supabase
        .from('influencer_payouts')
        .select(`
          id,
          influencer_id,
          total_commission,
          period_start,
          period_end,
          status,
          created_at,
          profiles!inner(username)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      return data?.map((payout: any) => ({
        ...payout,
        username: payout.profiles?.username || 'Unknown'
      })) || [];
    },
  });

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateStr: string) => 
    new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'processed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'failed': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div>
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const pendingPayouts = payouts?.filter(p => p.status === 'pending') || [];
  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.total_commission, 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Recent Payouts
          </CardTitle>
          <CardDescription>
            Latest payout requests and processed payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No payouts found
            </div>
          ) : (
            <div className="space-y-3">
              {payouts?.map((payout) => (
                <div key={payout.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-muted rounded-full">
                      <User className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{payout.username}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(payout.period_start)} - {formatDate(payout.period_end)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(payout.total_commission)}</p>
                    <Badge variant="secondary" className={getStatusColor(payout.status)}>
                      {payout.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Payout Actions
          </CardTitle>
          <CardDescription>
            Manage pending payouts and processes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-muted rounded-lg">
            <p className="text-sm font-medium mb-1">Pending Payouts</p>
            <p className="text-2xl font-bold">{formatCurrency(totalPending)}</p>
            <p className="text-xs text-muted-foreground">{pendingPayouts.length} influencers</p>
          </div>

          <div className="space-y-2">
            <Button className="w-full" disabled={pendingPayouts.length === 0}>
              Process All Pending
            </Button>
            <Button variant="outline" className="w-full">
              Generate Payout Report
            </Button>
            <Button variant="outline" className="w-full">
              Schedule Automatic Payouts
            </Button>
          </div>

          <div className="text-xs text-muted-foreground">
            Next automatic payout: End of month
          </div>
        </CardContent>
      </Card>
    </div>
  );
};