import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Crown } from 'lucide-react';
import { User } from '@/components/admin/users/types';

interface InfluencerExpirationAlertsProps {
  influencers: User[];
}

export const InfluencerExpirationAlerts: React.FC<InfluencerExpirationAlertsProps> = ({ influencers }) => {
  const now = new Date();
  
  const expiredInfluencers = influencers.filter(inf => 
    inf.influencer_expires_at && new Date(inf.influencer_expires_at) < now
  );
  
  const expiringInfluencers = influencers.filter(inf => {
    if (!inf.influencer_expires_at) return false;
    const expiry = new Date(inf.influencer_expires_at);
    const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry > 0 && daysUntilExpiry <= 7;
  });

  if (expiredInfluencers.length === 0 && expiringInfluencers.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4 mb-6">
      {expiredInfluencers.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{expiredInfluencers.length}</strong> influencer{expiredInfluencers.length !== 1 ? 's have' : ' has'} expired
            </span>
            <div className="flex gap-2">
              {expiredInfluencers.slice(0, 3).map(inf => (
                <Badge key={inf.id} variant="destructive" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  {inf.username || inf.email.split('@')[0]}
                </Badge>
              ))}
              {expiredInfluencers.length > 3 && (
                <Badge variant="destructive" className="text-xs">
                  +{expiredInfluencers.length - 3} more
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {expiringInfluencers.length > 0 && (
        <Alert>
          <Clock className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              <strong>{expiringInfluencers.length}</strong> influencer{expiringInfluencers.length !== 1 ? 's expire' : ' expires'} within 7 days
            </span>
            <div className="flex gap-2">
              {expiringInfluencers.slice(0, 3).map(inf => (
                <Badge key={inf.id} variant="secondary" className="text-xs">
                  <Crown className="h-3 w-3 mr-1" />
                  {inf.username || inf.email.split('@')[0]}
                </Badge>
              ))}
              {expiringInfluencers.length > 3 && (
                <Badge variant="secondary" className="text-xs">
                  +{expiringInfluencers.length - 3} more
                </Badge>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};