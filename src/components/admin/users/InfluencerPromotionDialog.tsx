
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { User, InfluencerMetadata } from './types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Crown, Percent, Calendar, Gift } from 'lucide-react';

interface InfluencerPromotionDialogProps {
  user: User;
  open: boolean;
  onClose: () => void;
  onPromote: (userId: string, tier: 'GRADUATE' | 'MASTER', metadata: InfluencerMetadata, expirationMonths: number, notes?: string) => Promise<void>;
}

export const InfluencerPromotionDialog: React.FC<InfluencerPromotionDialogProps> = ({
  user,
  open,
  onClose,
  onPromote
}) => {
  const [loading, setLoading] = useState(false);
  const [influencerTier, setInfluencerTier] = useState<'GRADUATE' | 'MASTER'>('GRADUATE');
  const [couponPercentage, setCouponPercentage] = useState<number>(10);
  const [expirationMonths, setExpirationMonths] = useState<number>(12);
  const [notes, setNotes] = useState('');
  const [metadata, setMetadata] = useState<InfluencerMetadata>({
    instagram: { handle: '', followers: 0 },
    tiktok: { handle: '', followers: 0 },
    youtube: { handle: '', subscribers: 0 },
    twitter: { handle: '', followers: 0 },
    linkedin: { handle: '', connections: 0 }
  });

  const generatePreviewCouponCode = () => {
    const firstName = user.username?.split(' ')[0] || user.username?.split('.')[0] || user.username?.split('_')[0] || 'USER';
    return `${firstName.toUpperCase()}${couponPercentage}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 Form submitted - promoting user:', user.id, 'to tier:', influencerTier);
    
    if (!user.id) {
      console.error('❌ No user ID provided');
      return;
    }

    setLoading(true);
    
    try {
      console.log('📋 Promotion data:', {
        userId: user.id,
        tier: influencerTier,
        metadata,
        expirationMonths,
        notes
      });

      await onPromote(user.id, influencerTier, metadata, expirationMonths, notes);
      
      console.log('✅ Promotion successful, closing dialog');
      onClose();
      
      // Reset form
      setInfluencerTier('GRADUATE');
      setCouponPercentage(10);
      setExpirationMonths(12);
      setNotes('');
      setMetadata({
        instagram: { handle: '', followers: 0 },
        tiktok: { handle: '', followers: 0 },
        youtube: { handle: '', subscribers: 0 },
        twitter: { handle: '', followers: 0 },
        linkedin: { handle: '', connections: 0 }
      });
    } catch (error) {
      console.error('❌ Error in form submission:', error);
      // Error handling is already done in the onPromote function
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-yellow-500" />
            Promote {user.username} to Influencer
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-Generated Coupon Preview */}
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Gift className="h-5 w-5 text-yellow-600" />
                Auto-Generated Coupon
              </CardTitle>
              <CardDescription>
                A unique coupon will be automatically created for this influencer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center p-4 bg-white rounded-lg border-2 border-dashed border-yellow-300">
                <Badge className="text-2xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-6 py-2">
                  {generatePreviewCouponCode()}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2 text-center">
                {couponPercentage}% discount • Valid for {expirationMonths} months
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {/* Influencer Tier */}
            <div className="space-y-2">
              <Label htmlFor="tier">Influencer Tier</Label>
              <Select value={influencerTier} onValueChange={(value: 'GRADUATE' | 'MASTER') => setInfluencerTier(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRADUATE">Graduate Influencer</SelectItem>
                  <SelectItem value="MASTER">Master Influencer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Coupon Percentage */}
            <div className="space-y-2">
              <Label htmlFor="percentage" className="flex items-center gap-2">
                <Percent className="h-4 w-4" />
                Coupon Discount
              </Label>
              <Select value={couponPercentage.toString()} onValueChange={(value) => setCouponPercentage(Number(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10% Discount</SelectItem>
                  <SelectItem value="15">15% Discount</SelectItem>
                  <SelectItem value="20">20% Discount</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Expiration */}
          <div className="space-y-2">
            <Label htmlFor="expiration" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Influencer Status Duration (Months)
            </Label>
            <Input
              type="number"
              value={expirationMonths}
              onChange={(e) => setExpirationMonths(Number(e.target.value))}
              min="1"
              max="24"
              placeholder="12"
            />
          </div>

          {/* Social Media Metadata */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Social Media Profiles (Optional)</Label>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Instagram Handle</Label>
                <Input
                  value={metadata.instagram?.handle || ''}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    instagram: { ...prev.instagram, handle: e.target.value }
                  }))}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram Followers</Label>
                <Input
                  type="number"
                  value={metadata.instagram?.followers || 0}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    instagram: { ...prev.instagram, followers: Number(e.target.value) }
                  }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>TikTok Handle</Label>
                <Input
                  value={metadata.tiktok?.handle || ''}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    tiktok: { ...prev.tiktok, handle: e.target.value }
                  }))}
                  placeholder="@username"
                />
              </div>
              <div className="space-y-2">
                <Label>TikTok Followers</Label>
                <Input
                  type="number"
                  value={metadata.tiktok?.followers || 0}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    tiktok: { ...prev.tiktok, followers: Number(e.target.value) }
                  }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>YouTube Channel</Label>
                <Input
                  value={metadata.youtube?.handle || ''}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    youtube: { ...prev.youtube, handle: e.target.value }
                  }))}
                  placeholder="Channel name"
                />
              </div>
              <div className="space-y-2">
                <Label>YouTube Subscribers</Label>
                <Input
                  type="number"
                  value={metadata.youtube?.subscribers || 0}
                  onChange={(e) => setMetadata(prev => ({
                    ...prev,
                    youtube: { ...prev.youtube, subscribers: Number(e.target.value) }
                  }))}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Promotion Notes (Optional)</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about this promotion..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
              {loading ? 'Promoting...' : 'Promote to Influencer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
