import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { DollarSign, Clock, CheckCircle, Play } from 'lucide-react';
import { toast } from 'sonner';

interface PayoutRecord {
  id: string;
  influencer_id: string;
  amount: number;
  currency: string;
  status: string;
  period_start: string;
  period_end: string;
  orders_count: number;
  processed_at?: string;
  created_at: string;
  profiles?: {
    username: string;
    email: string;
  };
}

export const PayoutManagement = () => {
  const queryClient = useQueryClient();

  const { data: payouts, isLoading } = useQuery({
    queryKey: ['influencer-payouts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('influencer_payouts')
        .select(`
          *,
          profiles!inner(username, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PayoutRecord[];
    },
  });

  const processPayoutsMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('process-payouts');
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['influencer-payouts'] });
      toast.success(`Processed ${data.processed} payouts successfully`);
    },
    onError: (error) => {
      toast.error(`Failed to process payouts: ${error.message}`);
    },
  });

  const approvePayoutMutation = useMutation({
    mutationFn: async (payoutId: string) => {
      const { error } = await supabase
        .from('influencer_payouts')
        .update({ 
          status: 'approved',
          processed_at: new Date().toISOString() 
        })
        .eq('id', payoutId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['influencer-payouts'] });
      toast.success('Payout approved successfully');
    },
    onError: (error) => {
      toast.error(`Failed to approve payout: ${error.message}`);
    },
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Approved</Badge>;
      case 'paid':
        return <Badge variant="secondary"><DollarSign className="w-3 h-3 mr-1" />Paid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const formatDate = (dateString: string) => 
    new Date(dateString).toLocaleDateString();

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="space-y-2">
                <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
                <div className="h-3 w-32 bg-muted rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const pendingPayouts = payouts?.filter(p => p.status === 'pending') || [];
  const totalPending = pendingPayouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingPayouts.length}</div>
            <p className="text-xs text-muted-foreground">
              Total: {formatCurrency(totalPending)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payouts?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Actions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => processPayoutsMutation.mutate()}
              disabled={processPayoutsMutation.isPending}
              size="sm"
              className="w-full"
            >
              {processPayoutsMutation.isPending ? 'Processing...' : 'Process New Payouts'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Influencer Payouts</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Influencer</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts?.map((payout) => (
                <TableRow key={payout.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{payout.profiles?.username}</div>
                      <div className="text-sm text-muted-foreground">{payout.profiles?.email}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {formatCurrency(payout.amount)}
                  </TableCell>
                  <TableCell>{payout.orders_count}</TableCell>
                  <TableCell className="text-sm">
                    {formatDate(payout.period_start)} - {formatDate(payout.period_end)}
                  </TableCell>
                  <TableCell>{getStatusBadge(payout.status)}</TableCell>
                  <TableCell className="text-sm">{formatDate(payout.created_at)}</TableCell>
                  <TableCell>
                    {payout.status === 'pending' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => approvePayoutMutation.mutate(payout.id)}
                        disabled={approvePayoutMutation.isPending}
                      >
                        Approve
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {!payouts || payouts.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No payouts found. Click "Process New Payouts" to generate payouts for eligible influencers.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};