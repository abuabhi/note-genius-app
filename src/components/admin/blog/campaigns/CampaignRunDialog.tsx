import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Clock, Target } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  description: string;
  topic_strategy: string;
  frequency_type: string;
  frequency_value: number;
  auto_publish: boolean;
  content_type: string;
}

interface CampaignRunDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign: Campaign | null;
}

export const CampaignRunDialog: React.FC<CampaignRunDialogProps> = ({
  open,
  onOpenChange,
  campaign,
}) => {
  if (!campaign) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Run Campaign Now
          </DialogTitle>
          <DialogDescription>
            Execute "{campaign.name}" immediately to generate a new blog post
          </DialogDescription>
        </DialogHeader>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="font-medium mb-2">Campaign Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span>Strategy: {campaign.topic_strategy}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>Type: {campaign.content_type}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">What will happen:</h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Generate content based on campaign settings</li>
                <li>• Apply SEO optimization</li>
                <li>• {campaign.auto_publish ? 'Automatically publish' : 'Save as draft for review'}</li>
                <li>• Update campaign next run time</li>
              </ul>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant={campaign.auto_publish ? 'default' : 'secondary'}>
                {campaign.auto_publish ? 'Auto-publish enabled' : 'Manual review required'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Run Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};