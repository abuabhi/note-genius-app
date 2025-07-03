import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award } from 'lucide-react';
import { useTopPerformers } from '@/hooks/admin/useInfluencerAnalytics';
import { Skeleton } from '@/components/ui/skeleton';

export const TopPerformersSection = () => {
  const { data: performers, isLoading } = useTopPerformers(10);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Performers</CardTitle>
          <CardDescription>Highest revenue generating influencers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 1: return <Medal className="h-4 w-4 text-gray-400" />;
      case 2: return <Award className="h-4 w-4 text-orange-500" />;
      default: return <span className="text-sm font-semibold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'MASTER': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'GRADUATE': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Top Performers
        </CardTitle>
        <CardDescription>
          Highest revenue generating influencers this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        {performers?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No performance data available yet
          </div>
        ) : (
          <div className="space-y-4">
            {performers?.map((performer, index) => (
              <div key={performer.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center w-8 h-8">
                  {getRankIcon(index)}
                </div>
                
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {performer.username?.slice(0, 2).toUpperCase() || 'UN'}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{performer.username}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className={getTierColor(performer.tier)}>
                      {performer.tier}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {performer.usageCount} uses
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-semibold">{formatCurrency(performer.totalRevenue)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(performer.totalCommissions)} comm.
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};