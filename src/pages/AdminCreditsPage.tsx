
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, CreditCard, Users, CheckCircle, XCircle, AlertCircle, TrendingUp, Calendar, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface UsageStats {
  total_credits: number;
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  unique_users: number;
}

interface UsageDetail {
  id: string;
  user_id: string;
  video_id: string;
  video_url: string;
  credits_used: number;
  success: boolean;
  error_message?: string;
  created_at: string;
  user_profile?: {
    username?: string;
  };
}

const AdminCreditsPage = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [usageDetails, setUsageDetails] = useState<UsageDetail[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [error, setError] = useState<string | null>(null);

  // Check if user is Dean tier
  const [userTier, setUserTier] = useState<string | null>(null);

  useEffect(() => {
    checkUserTier();
  }, [user]);

  useEffect(() => {
    if (userTier === 'DEAN') {
      fetchUsageData();
    }
  }, [selectedMonth, userTier]);

  const checkUserTier = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_tier')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserTier(data.user_tier);
    } catch (error) {
      console.error('Error checking user tier:', error);
      setError('Failed to verify admin access');
    }
  };

  const fetchUsageData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch usage stats
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_assemblyai_usage_stats', { target_month: selectedMonth });

      if (statsError) throw statsError;
      setStats(statsData[0] || { total_credits: 0, total_requests: 0, successful_requests: 0, failed_requests: 0, unique_users: 0 });

      // Fetch detailed usage with proper join
      const { data: detailsData, error: detailsError } = await supabase
        .from('assemblyai_usage')
        .select(`
          id,
          user_id,
          video_id,
          video_url,
          credits_used,
          success,
          error_message,
          created_at
        `)
        .eq('month_year', selectedMonth)
        .order('created_at', { ascending: false });

      if (detailsError) throw detailsError;

      // Fetch user profiles separately to avoid join issues
      const userIds = [...new Set(detailsData?.map(item => item.user_id) || [])];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, username')
        .in('id', userIds);

      // Combine the data
      const enrichedData = detailsData?.map(usage => ({
        ...usage,
        user_profile: profilesData?.find(profile => profile.id === usage.user_id)
      })) || [];

      setUsageDetails(enrichedData);

    } catch (error: any) {
      console.error('Error fetching usage data:', error);
      setError('Failed to fetch usage data');
      toast.error('Failed to load credit usage data');
    } finally {
      setIsLoading(false);
    }
  };

  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7);
      const displayStr = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
      options.push({ value: monthStr, label: displayStr });
    }
    
    return options;
  };

  const getSuccessRate = () => {
    if (!stats || stats.total_requests === 0) return 0;
    return Math.round((stats.successful_requests / stats.total_requests) * 100);
  };

  const getCreditUsagePercentage = () => {
    if (!stats) return 0;
    return Math.min((stats.total_credits / 100) * 100, 100);
  };

  if (!user) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please log in to access this page.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (userTier !== 'DEAN') {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Access denied. This page is only available to Dean tier users.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AssemblyAI Credit Monitoring</h1>
          <p className="text-muted-foreground">Monitor monthly API usage and credit consumption</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {generateMonthOptions().map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={fetchUsageData} disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : stats ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Credits Used</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_credits}/100</div>
                <Progress value={getCreditUsagePercentage()} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {100 - stats.total_credits} credits remaining
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total_requests}</div>
                <p className="text-xs text-muted-foreground">
                  API calls this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{getSuccessRate()}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.successful_requests} successful, {stats.failed_requests} failed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.unique_users}</div>
                <p className="text-xs text-muted-foreground">
                  Users who used transcription
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Usage Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Usage Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              {usageDetails.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No usage data for this month
                </div>
              ) : (
                <div className="space-y-2">
                  {usageDetails.map((usage) => (
                    <div
                      key={usage.id}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${usage.success ? 'bg-green-500' : 'bg-red-500'}`} />
                        <div>
                          <p className="font-medium">
                            {usage.user_profile?.username || `User ${usage.user_id.slice(0, 8)}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Video ID: {usage.video_id}
                          </p>
                          {usage.error_message && (
                            <p className="text-sm text-red-600">
                              Error: {usage.error_message}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          {usage.success ? (
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Success
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-red-50 text-red-700">
                              <XCircle className="h-3 w-3 mr-1" />
                              Failed
                            </Badge>
                          )}
                          <Badge variant="secondary">
                            <Zap className="h-3 w-3 mr-1" />
                            {usage.credits_used} credit{usage.credits_used !== 1 ? 's' : ''}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(usage.created_at).toLocaleDateString()} at{' '}
                          {new Date(usage.created_at).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default AdminCreditsPage;
