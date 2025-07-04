import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  DollarSign, 
  Users, 
  Gift,
  ExternalLink
} from 'lucide-react';
import { User } from '../users/types';
import { useInfluencerPerformance } from '@/hooks/admin/useInfluencerPerformance';

interface InfluencerTableRowProps {
  influencer: User;
  onViewDetails: (influencer: User) => void;
  onExtend: (userId: string, months: number) => Promise<void>;
  onRevoke: (userId: string, reason?: string) => Promise<void>;
  getStatusColor: (user: User) => string;
  getStatusText: (user: User) => string;
}

export const InfluencerTableRow: React.FC<InfluencerTableRowProps> = ({
  influencer,
  onViewDetails,
  onExtend,
  onRevoke,
  getStatusColor,
  getStatusText
}) => {
  const { data: performance } = useInfluencerPerformance(influencer.id);
  
  const statusColor = getStatusColor(influencer);
  const statusText = getStatusText(influencer);

  return (
    <TableRow>
      <TableCell>
        <div className="space-y-1">
          <div className="font-medium">{influencer.username}</div>
          <div className="text-sm text-muted-foreground">{influencer.email}</div>
          <div className="text-xs text-muted-foreground">
            Promoted: {influencer.influencer_promoted_at ? 
              new Date(influencer.influencer_promoted_at).toLocaleDateString() : 'Unknown'}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          {influencer.influencer_tier}
        </Badge>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-mono">
            {performance?.couponCode || 'Loading...'}
          </Badge>
          <Gift className="h-4 w-4 text-yellow-500" />
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${statusColor}`}></div>
          <span className="text-sm">{statusText}</span>
        </div>
        {influencer.influencer_expires_at && (
          <div className="text-xs text-muted-foreground">
            Expires: {new Date(influencer.influencer_expires_at).toLocaleDateString()}
          </div>
        )}
      </TableCell>
      
      <TableCell>
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <Users className="h-3 w-3" />
            {performance ? `${performance.totalUses} uses` : 'Loading...'}
          </div>
          <div className="flex items-center gap-1 text-sm text-green-600">
            <DollarSign className="h-3 w-3" />
            {performance ? `$${performance.totalCommission.toFixed(2)} earned` : 'Loading...'}
          </div>
        </div>
      </TableCell>
      
      <TableCell>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onViewDetails(influencer)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Details
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => onExtend(influencer.id, 6)}
          >
            <Calendar className="h-3 w-3 mr-1" />
            Extend
          </Button>
          
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onRevoke(influencer.id, 'Manual revocation by admin')}
          >
            Revoke
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};