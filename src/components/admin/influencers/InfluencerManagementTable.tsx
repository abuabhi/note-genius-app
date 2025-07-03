import React, { useState } from 'react';
import { User } from '@/components/admin/users/types';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  ExternalLink, 
  AlertTriangle, 
  Calendar,
  XCircle,
  Plus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfluencerMetadataViewer } from './InfluencerMetadataViewer';

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
  const [extensionMonths, setExtensionMonths] = useState(3);
  const [revokeReason, setRevokeReason] = useState('');

  const getExpiryStatus = (expiryDate: string) => {
    const now = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) {
      return { status: 'expired', color: 'destructive', text: 'Expired' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'expiring', color: 'orange', text: `${daysUntilExpiry} days left` };
    } else if (daysUntilExpiry <= 30) {
      return { status: 'warning', color: 'yellow', text: `${daysUntilExpiry} days left` };
    } else {
      return { status: 'active', color: 'green', text: `${daysUntilExpiry} days left` };
    }
  };

  return (
    <div className="rounded-md border bg-white">
      <Table>
        <TableCaption>
          Active influencer accounts and their status
        </TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Influencer</TableHead>
            <TableHead>Tier</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Promoted</TableHead>
            <TableHead>Expires</TableHead>
            <TableHead>Social Media</TableHead>
            <TableHead className="w-[200px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {influencers.length > 0 ? (
            influencers.map((influencer) => {
              const expiryStatus = influencer.influencer_expires_at 
                ? getExpiryStatus(influencer.influencer_expires_at)
                : null;
              
              return (
                <TableRow key={influencer.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{influencer.email}</span>
                      {influencer.username && (
                        <span className="text-sm text-muted-foreground">@{influencer.username}</span>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1 w-fit">
                      <Crown className="h-3 w-3" />
                      {influencer.influencer_tier}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    {expiryStatus && (
                      <Badge 
                        variant={expiryStatus.status === 'expired' ? 'destructive' : 'secondary'}
                        className={`${
                          expiryStatus.status === 'expiring' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                          expiryStatus.status === 'warning' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                          expiryStatus.status === 'active' ? 'bg-green-100 text-green-800 border-green-200' : ''
                        }`}
                      >
                        {expiryStatus.status === 'expired' && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {expiryStatus.text}
                      </Badge>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {influencer.influencer_promoted_at && (
                      <span className="text-sm text-muted-foreground">
                        {new Date(influencer.influencer_promoted_at).toLocaleDateString()}
                      </span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    {influencer.influencer_expires_at && (
                      <span className="text-sm">
                        {new Date(influencer.influencer_expires_at).toLocaleDateString()}
                      </span>
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <InfluencerMetadataViewer metadata={influencer.influencer_metadata} />
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="outline" className="h-8 px-2">
                            <Plus className="h-3 w-3 mr-1" />
                            Extend
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Extend Influencer Status</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="months">Extension (months)</Label>
                              <Input
                                id="months"
                                type="number"
                                min="1"
                                max="12"
                                value={extensionMonths}
                                onChange={(e) => setExtensionMonths(parseInt(e.target.value))}
                              />
                            </div>
                            <Button 
                              onClick={() => extendInfluencer(influencer.id, extensionMonths)}
                              className="w-full"
                            >
                              <Calendar className="h-4 w-4 mr-2" />
                              Extend Status
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="destructive" className="h-8 px-2">
                            <XCircle className="h-3 w-3 mr-1" />
                            Revoke
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Revoke Influencer Status</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reason">Reason (optional)</Label>
                              <Input
                                id="reason"
                                placeholder="Enter reason for revocation..."
                                value={revokeReason}
                                onChange={(e) => setRevokeReason(e.target.value)}
                              />
                            </div>
                            <Button 
                              onClick={() => revokeInfluencer(influencer.id, revokeReason)}
                              variant="destructive"
                              className="w-full"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Revoke Status
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No influencers found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};