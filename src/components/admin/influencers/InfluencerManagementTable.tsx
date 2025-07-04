
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Crown, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Gift,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { User } from '../users/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useInfluencerPerformance } from '@/hooks/admin/useInfluencerPerformance';
import { InfluencerTableRow } from './InfluencerTableRow';

interface InfluencerManagementTableProps {
  influencers: User[];
  revokeInfluencer: (userId: string, reason?: string) => Promise<void>;
  extendInfluencer: (userId: string, months: number) => Promise<void>;
}

export const InfluencerManagementTable: React.FC<InfluencerManagementTableProps> = ({
  influencers,
  revokeInfluencer,
  extendInfluencer
}) => {
  const [selectedInfluencer, setSelectedInfluencer] = useState<User | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  const getStatusColor = (user: User) => {
    if (!user.influencer_expires_at) return 'bg-gray-500';
    
    const now = new Date();
    const expiryDate = new Date(user.influencer_expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'bg-red-500'; // Expired
    if (daysUntilExpiry <= 7) return 'bg-yellow-500'; // Expiring soon
    return 'bg-green-500'; // Active
  };

  const getStatusText = (user: User) => {
    if (!user.influencer_expires_at) return 'Active';
    
    const now = new Date();
    const expiryDate = new Date(user.influencer_expires_at);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'Expired';
    if (daysUntilExpiry <= 7) return `Expires in ${daysUntilExpiry} days`;
    return 'Active';
  };

  const handleViewDetails = (influencer: User) => {
    setSelectedInfluencer(influencer);
    setShowDetailsDialog(true);
  };

  // Real performance data for the selected influencer details
  const { data: selectedInfluencerPerformance } = useInfluencerPerformance(
    selectedInfluencer?.id || ''
  );

  const mockSocialStats: Record<string, any> = {
    instagram: { handle: '@james_study', followers: 15200 },
    tiktok: { handle: '@jameslearns', followers: 8900 },
    youtube: { handle: 'James Study Channel', subscribers: 3400 }
  };

  if (influencers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <Crown className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-muted-foreground">No Influencers Found</h3>
          <p className="text-sm text-muted-foreground">No influencers match your current filters.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Influencer Management ({influencers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Influencer</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Coupon Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Performance</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {influencers.map((influencer) => (
                  <InfluencerTableRow
                    key={influencer.id}
                    influencer={influencer}
                    onViewDetails={handleViewDetails}
                    onExtend={extendInfluencer}
                    onRevoke={revokeInfluencer}
                    getStatusColor={getStatusColor}
                    getStatusText={getStatusText}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Influencer Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-yellow-500" />
              {selectedInfluencer?.username} - Influencer Details
            </DialogTitle>
          </DialogHeader>

          {selectedInfluencer && (
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="performance">Performance</TabsTrigger>
                <TabsTrigger value="social">Social Media</TabsTrigger>
                <TabsTrigger value="payouts">Payouts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Influencer Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Tier:</span>
                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                          {selectedInfluencer.influencer_tier}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={`flex items-center gap-1 ${getStatusColor(selectedInfluencer).replace('bg-', 'text-')}`}>
                          {getStatusText(selectedInfluencer) === 'Active' ? <CheckCircle className="h-3 w-3" /> : 
                           getStatusText(selectedInfluencer).includes('Expires') ? <Clock className="h-3 w-3" /> :
                           <AlertTriangle className="h-3 w-3" />}
                          {getStatusText(selectedInfluencer)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Promoted:</span>
                        <span>{selectedInfluencer.influencer_promoted_at ? 
                          new Date(selectedInfluencer.influencer_promoted_at).toLocaleDateString() : 'Unknown'}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Gift className="h-4 w-4" />
                        Coupon Details
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span>Code:</span>
                        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-mono">
                          {selectedInfluencerPerformance?.couponCode || 'N/A'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Total Uses
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{selectedInfluencerPerformance?.totalUses || 0}</div>
                      <p className="text-sm text-green-600">+{selectedInfluencerPerformance?.thisMonthUses || 0} this month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4" />
                        Commission Earned
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${selectedInfluencerPerformance?.totalCommission.toFixed(2) || '0.00'}</div>
                      <p className="text-sm text-green-600">+${selectedInfluencerPerformance?.thisMonthCommission.toFixed(2) || '0.00'} this month</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Avg Order Value
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">${selectedInfluencerPerformance?.avgOrderValue.toFixed(2) || '0.00'}</div>
                      <p className="text-sm text-muted-foreground">Per transaction</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="social" className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  {Object.entries(mockSocialStats).map(([platform, data]) => (
                    <Card key={platform}>
                      <CardContent className="flex items-center justify-between p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                            {platform[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium capitalize">{platform}</div>
                            <div className="text-sm text-muted-foreground">{data.handle}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {'followers' in data ? data.followers?.toLocaleString() : 
                             'subscribers' in data ? data.subscribers?.toLocaleString() :
                             'connections' in data ? data.connections?.toLocaleString() : '0'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {'followers' in data ? 'followers' : 
                             'subscribers' in data ? 'subscribers' :
                             'connections' in data ? 'connections' : 'count'}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="payouts" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Payout History</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No payouts processed yet</p>
                      <p className="text-sm">Commission payouts will appear here once processed</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
