import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ExternalLink } from 'lucide-react';
import { InfluencerMetadata } from '@/components/admin/users/types';

interface InfluencerMetadataViewerProps {
  metadata?: InfluencerMetadata;
}

export const InfluencerMetadataViewer: React.FC<InfluencerMetadataViewerProps> = ({ metadata }) => {
  if (!metadata || Object.keys(metadata).length === 0) {
    return <span className="text-sm text-muted-foreground">No social media</span>;
  }

  const platforms = Object.entries(metadata).filter(([_, data]) => data && typeof data === 'object');

  if (platforms.length === 0) {
    return <span className="text-sm text-muted-foreground">No social media</span>;
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8">
          <ExternalLink className="h-3 w-3 mr-1" />
          {platforms.length} platform{platforms.length !== 1 ? 's' : ''}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Social Media Platforms</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {platforms.map(([platform, data]) => {
            const platformData = data as any;
            const followers = platformData.followers || platformData.subscribers || platformData.connections || 0;
            const handle = platformData.handle || '';
            
            return (
              <div key={platform} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="capitalize">
                    {platform}
                  </Badge>
                  <div>
                    <p className="font-medium">@{handle}</p>
                    <p className="text-sm text-muted-foreground">
                      {followers.toLocaleString()} {
                        platform === 'youtube' ? 'subscribers' :
                        platform === 'linkedin' ? 'connections' :
                        'followers'
                      }
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a 
                    href={`https://${platform}.com/${handle}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};