import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, InfluencerMetadata } from "./types";
import { UserTier } from "@/hooks/useRequireAuth";

interface InfluencerPromotionDialogProps {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onPromote: (
    userId: string,
    tier: 'GRADUATE' | 'MASTER',
    metadata: InfluencerMetadata,
    expirationMonths: number,
    notes?: string
  ) => void;
}

export const InfluencerPromotionDialog: React.FC<InfluencerPromotionDialogProps> = ({
  user,
  open,
  onClose,
  onPromote
}) => {
  const [tier, setTier] = useState<'GRADUATE' | 'MASTER'>('GRADUATE');
  const [expirationMonths, setExpirationMonths] = useState<number>(12);
  const [notes, setNotes] = useState('');
  const [metadata, setMetadata] = useState<InfluencerMetadata>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    onPromote(user.id, tier, metadata, expirationMonths, notes);
    onClose();
    
    // Reset form
    setTier('GRADUATE');
    setExpirationMonths(12);
    setNotes('');
    setMetadata({});
  };

  const updatePlatformMetadata = (platform: keyof InfluencerMetadata, handle: string, count: number) => {
    setMetadata(prev => ({
      ...prev,
      [platform]: { handle, [platform === 'youtube' ? 'subscribers' : platform === 'linkedin' ? 'connections' : 'followers']: count }
    }));
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Promote User to Influencer</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-mint-50 p-4 rounded-lg">
            <h3 className="font-medium text-mint-900 mb-2">User Information</h3>
            <p className="text-sm text-mint-700">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-mint-700">
              <strong>Current Tier:</strong> {user.user_tier}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tier">Influencer Tier</Label>
              <Select value={tier} onValueChange={(value) => setTier(value as 'GRADUATE' | 'MASTER')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GRADUATE">Graduate (Mid-tier Influencer)</SelectItem>
                  <SelectItem value="MASTER">Master (Top-tier Influencer)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="expiration">Expires In</Label>
              <Select value={expirationMonths.toString()} onValueChange={(value) => setExpirationMonths(parseInt(value))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Month</SelectItem>
                  <SelectItem value="3">3 Months</SelectItem>
                  <SelectItem value="6">6 Months</SelectItem>
                  <SelectItem value="12">12 Months</SelectItem>
                  <SelectItem value="24">24 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Social Media Platforms</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Instagram */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Instagram Handle</Label>
                  <Input
                    placeholder="@username"
                    value={metadata.instagram?.handle || ''}
                    onChange={(e) => updatePlatformMetadata('instagram', e.target.value, metadata.instagram?.followers || 0)}
                  />
                </div>
                <div>
                  <Label>Followers</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={metadata.instagram?.followers || ''}
                    onChange={(e) => updatePlatformMetadata('instagram', metadata.instagram?.handle || '', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* TikTok */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>TikTok Handle</Label>
                  <Input
                    placeholder="@username"
                    value={metadata.tiktok?.handle || ''}
                    onChange={(e) => updatePlatformMetadata('tiktok', e.target.value, metadata.tiktok?.followers || 0)}
                  />
                </div>
                <div>
                  <Label>Followers</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={metadata.tiktok?.followers || ''}
                    onChange={(e) => updatePlatformMetadata('tiktok', metadata.tiktok?.handle || '', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* YouTube */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>YouTube Handle</Label>
                  <Input
                    placeholder="@channel"
                    value={metadata.youtube?.handle || ''}
                    onChange={(e) => updatePlatformMetadata('youtube', e.target.value, metadata.youtube?.subscribers || 0)}
                  />
                </div>
                <div>
                  <Label>Subscribers</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={metadata.youtube?.subscribers || ''}
                    onChange={(e) => updatePlatformMetadata('youtube', metadata.youtube?.handle || '', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Twitter */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Twitter Handle</Label>
                  <Input
                    placeholder="@username"
                    value={metadata.twitter?.handle || ''}
                    onChange={(e) => updatePlatformMetadata('twitter', e.target.value, metadata.twitter?.followers || 0)}
                  />
                </div>
                <div>
                  <Label>Followers</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={metadata.twitter?.followers || ''}
                    onChange={(e) => updatePlatformMetadata('twitter', metadata.twitter?.handle || '', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>LinkedIn Handle</Label>
                  <Input
                    placeholder="linkedin.com/in/username"
                    value={metadata.linkedin?.handle || ''}
                    onChange={(e) => updatePlatformMetadata('linkedin', e.target.value, metadata.linkedin?.connections || 0)}
                  />
                </div>
                <div>
                  <Label>Connections</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={metadata.linkedin?.connections || ''}
                    onChange={(e) => updatePlatformMetadata('linkedin', metadata.linkedin?.handle || '', parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add any additional notes about this influencer..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-gradient-to-r from-mint-600 to-mint-500">
              Promote to Influencer
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};