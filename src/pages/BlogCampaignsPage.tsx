import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Trash2, 
  Clock, 
  Target,
  Activity,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { CampaignCreateDialog } from '@/components/admin/blog/campaigns/CampaignCreateDialog';
import { CampaignEditDialog } from '@/components/admin/blog/campaigns/CampaignEditDialog';
import { CampaignRunDialog } from '@/components/admin/blog/campaigns/CampaignRunDialog';

interface Campaign {
  id: string;
  name: string;
  description: string;
  status: string;
  topic_strategy: string;
  frequency_type: string;
  frequency_value: number;
  next_run_at: string;
  last_run_at: string;
  auto_publish: boolean;
  is_active: boolean;
  created_at: string;
}

const BlogCampaignsPage = () => {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [runningCampaign, setRunningCampaign] = useState<Campaign | null>(null);
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['blog-campaigns'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_campaigns')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Campaign[];
    }
  });

  const toggleCampaignMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('blog_campaigns')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-campaigns'] });
      toast.success('Campaign status updated');
    },
    onError: (error) => {
      toast.error(`Failed to update campaign: ${error.message}`);
    }
  });

  const deleteCampaignMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('blog_campaigns')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-campaigns'] });
      toast.success('Campaign deleted');
    },
    onError: (error) => {
      toast.error(`Failed to delete campaign: ${error.message}`);
    }
  });

  const runNowMutation = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase.functions.invoke('process-blog-campaigns', {
        body: { campaignId, runNow: true }
      });
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Campaign executed successfully');
      queryClient.invalidateQueries({ queryKey: ['blog-campaigns'] });
    },
    onError: (error) => {
      toast.error(`Failed to run campaign: ${error.message}`);
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'paused': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'stopped': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  const formatFrequency = (type: string, value: number) => {
    const unit = value === 1 ? type.slice(0, -1) : type;
    return `Every ${value} ${unit}`;
  };

  const formatNextRun = (nextRun: string) => {
    const date = new Date(nextRun);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    return 'Overdue';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Blog Campaigns</h1>
          <p className="text-muted-foreground">Automate your blog content generation</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {campaigns?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Create your first automated blog campaign to start generating content on autopilot
            </p>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Campaign
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {campaigns?.map((campaign) => (
            <Card key={campaign.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{campaign.name}</CardTitle>
                    {campaign.description && (
                      <CardDescription className="text-sm">
                        {campaign.description}
                      </CardDescription>
                    )}
                  </div>
                  <Badge className={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatFrequency(campaign.frequency_type, campaign.frequency_value)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{campaign.next_run_at ? formatNextRun(campaign.next_run_at) : 'Not scheduled'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="capitalize">{campaign.topic_strategy}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>{campaign.auto_publish ? 'Auto-publish' : 'Manual review'}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => 
                      toggleCampaignMutation.mutate({
                        id: campaign.id,
                        status: campaign.status === 'active' ? 'paused' : 'active'
                      })
                    }
                    disabled={toggleCampaignMutation.isPending}
                  >
                    {campaign.status === 'active' ? (
                      <Pause className="h-3 w-3" />
                    ) : (
                      <Play className="h-3 w-3" />
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingCampaign(campaign)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => runNowMutation.mutate(campaign.id)}
                    disabled={runNowMutation.isPending}
                  >
                    Run Now
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteCampaignMutation.mutate(campaign.id)}
                    disabled={deleteCampaignMutation.isPending}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CampaignCreateDialog 
        open={createDialogOpen} 
        onOpenChange={setCreateDialogOpen}
      />
      
      <CampaignEditDialog
        open={!!editingCampaign}
        onOpenChange={(open) => !open && setEditingCampaign(null)}
        campaign={editingCampaign}
      />
      
      <CampaignRunDialog
        open={!!runningCampaign}
        onOpenChange={(open) => !open && setRunningCampaign(null)}
        campaign={runningCampaign}
      />
    </div>
  );
};

export default BlogCampaignsPage;