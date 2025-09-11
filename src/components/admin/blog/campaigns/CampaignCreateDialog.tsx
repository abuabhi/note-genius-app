import React, { useState } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

interface CampaignCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CampaignCreateDialog: React.FC<CampaignCreateDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    topic_strategy: 'random',
    fixed_topic: '',
    keywords: [] as string[],
    frequency_type: 'days',
    frequency_value: 7,
    auto_publish: true,
    publish_delay_hours: 0,
    content_type: 'educational',
    min_word_count: 800,
    max_word_count: 1500,
    seo_keywords: [] as string[],
  });
  
  const [topicList, setTopicList] = useState<string[]>([]);
  const [currentTopic, setCurrentTopic] = useState('');
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [currentSeoKeyword, setCurrentSeoKeyword] = useState('');
  
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ['blog-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      return data;
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Calculate next run time
      const now = new Date();
      const nextRun = new Date(now);
      
      switch (data.frequency_type) {
        case 'days':
          nextRun.setDate(now.getDate() + data.frequency_value);
          break;
        case 'weeks':
          nextRun.setDate(now.getDate() + (data.frequency_value * 7));
          break;
        case 'months':
          nextRun.setMonth(now.getMonth() + data.frequency_value);
          break;
      }

      const { data: campaign, error } = await supabase
        .from('blog_campaigns')
        .insert({
          ...data,
          user_id: user.id,
          next_run_at: nextRun.toISOString(),
        })
        .select()
        .single();
      
      if (error) throw error;

      // Insert topics if using topic rotation strategy
      if (data.topic_strategy === 'rotation' && topicList.length > 0) {
        const topicInserts = topicList.map((topic, index) => ({
          campaign_id: campaign.id,
          topic,
          sort_order: index,
        }));

        const { error: topicsError } = await supabase
          .from('blog_campaign_topics')
          .insert(topicInserts);
        
        if (topicsError) throw topicsError;
      }

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['blog-campaigns'] });
      toast.success('Campaign created successfully');
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create campaign: ${error.message}`);
    }
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      topic_strategy: 'random',
      fixed_topic: '',
      keywords: [],
      frequency_type: 'days',
      frequency_value: 7,
      auto_publish: true,
      publish_delay_hours: 0,
      content_type: 'educational',
      min_word_count: 800,
      max_word_count: 1500,
      seo_keywords: [],
    });
    setTopicList([]);
    setCurrentTopic('');
    setCurrentKeyword('');
    setCurrentSeoKeyword('');
  };

  const addTopic = () => {
    if (currentTopic.trim() && !topicList.includes(currentTopic.trim())) {
      setTopicList([...topicList, currentTopic.trim()]);
      setCurrentTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setTopicList(topicList.filter(t => t !== topic));
  };

  const addKeyword = () => {
    if (currentKeyword.trim() && !formData.keywords.includes(currentKeyword.trim())) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, currentKeyword.trim()]
      });
      setCurrentKeyword('');
    }
  };

  const removeKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      keywords: formData.keywords.filter(k => k !== keyword)
    });
  };

  const addSeoKeyword = () => {
    if (currentSeoKeyword.trim() && !formData.seo_keywords.includes(currentSeoKeyword.trim())) {
      setFormData({
        ...formData,
        seo_keywords: [...formData.seo_keywords, currentSeoKeyword.trim()]
      });
      setCurrentSeoKeyword('');
    }
  };

  const removeSeoKeyword = (keyword: string) => {
    setFormData({
      ...formData,
      seo_keywords: formData.seo_keywords.filter(k => k !== keyword)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Campaign name is required');
      return;
    }
    
    if (formData.topic_strategy === 'fixed' && !formData.fixed_topic.trim()) {
      toast.error('Fixed topic is required when using fixed topic strategy');
      return;
    }
    
    if (formData.topic_strategy === 'rotation' && topicList.length === 0) {
      toast.error('At least one topic is required for rotation strategy');
      return;
    }
    
    createCampaignMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Blog Campaign</DialogTitle>
          <DialogDescription>
            Set up an automated campaign to generate blog content on a schedule
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Campaign Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Weekly Study Tips"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this campaign will generate..."
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Topic Strategy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Topic Strategy</CardTitle>
              <CardDescription>
                How should topics be chosen for each post?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="topic_strategy">Strategy</Label>
                <Select
                  value={formData.topic_strategy}
                  onValueChange={(value) => setFormData({ ...formData, topic_strategy: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">AI Generated (Random Topics)</SelectItem>
                    <SelectItem value="fixed">Fixed Topic</SelectItem>
                    <SelectItem value="rotation">Topic Rotation</SelectItem>
                    <SelectItem value="keywords">Keyword-Based</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.topic_strategy === 'fixed' && (
                <div>
                  <Label htmlFor="fixed_topic">Fixed Topic *</Label>
                  <Input
                    id="fixed_topic"
                    value={formData.fixed_topic}
                    onChange={(e) => setFormData({ ...formData, fixed_topic: e.target.value })}
                    placeholder="e.g., Mathematics Study Techniques"
                    required
                  />
                </div>
              )}

              {formData.topic_strategy === 'rotation' && (
                <div>
                  <Label>Topic List *</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentTopic}
                      onChange={(e) => setCurrentTopic(e.target.value)}
                      placeholder="Add a topic..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                    />
                    <Button type="button" onClick={addTopic}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {topicList.map((topic) => (
                      <Badge key={topic} variant="secondary" className="gap-1">
                        {topic}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeTopic(topic)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {(formData.topic_strategy === 'keywords' || formData.topic_strategy === 'random') && (
                <div>
                  <Label>Content Keywords</Label>
                  <div className="flex gap-2">
                    <Input
                      value={currentKeyword}
                      onChange={(e) => setCurrentKeyword(e.target.value)}
                      placeholder="Add keywords to influence content..."
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKeyword())}
                    />
                    <Button type="button" onClick={addKeyword}>
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.keywords.map((keyword) => (
                      <Badge key={keyword} variant="secondary" className="gap-1">
                        {keyword}
                        <X 
                          className="h-3 w-3 cursor-pointer" 
                          onClick={() => removeKeyword(keyword)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Schedule Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="frequency_type">Frequency</Label>
                  <Select
                    value={formData.frequency_type}
                    onValueChange={(value) => setFormData({ ...formData, frequency_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="weeks">Weeks</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="frequency_value">Every</Label>
                  <Input
                    id="frequency_value"
                    type="number"
                    min={1}
                    value={formData.frequency_value}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      frequency_value: parseInt(e.target.value) || 1 
                    })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Publishing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Publishing Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto_publish">Auto-publish</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically publish posts or save as drafts for review
                  </p>
                </div>
                <Switch
                  id="auto_publish"
                  checked={formData.auto_publish}
                  onCheckedChange={(checked) => setFormData({ ...formData, auto_publish: checked })}
                />
              </div>
              
              {formData.auto_publish && (
                <div>
                  <Label htmlFor="publish_delay_hours">Publish Delay (hours)</Label>
                  <Input
                    id="publish_delay_hours"
                    type="number"
                    min={0}
                    value={formData.publish_delay_hours}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      publish_delay_hours: parseInt(e.target.value) || 0 
                    })}
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Delay before publishing (0 = immediate)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Content Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Content Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="content_type">Content Type</Label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value) => setFormData({ ...formData, content_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">Educational</SelectItem>
                    <SelectItem value="howto">How-to Guide</SelectItem>
                    <SelectItem value="tips">Tips & Tricks</SelectItem>
                    <SelectItem value="news">News & Updates</SelectItem>
                    <SelectItem value="review">Review & Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="min_word_count">Min Words</Label>
                  <Input
                    id="min_word_count"
                    type="number"
                    min={100}
                    value={formData.min_word_count}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      min_word_count: parseInt(e.target.value) || 800 
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="max_word_count">Max Words</Label>
                  <Input
                    id="max_word_count"
                    type="number"
                    min={100}
                    value={formData.max_word_count}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      max_word_count: parseInt(e.target.value) || 1500 
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>SEO Keywords</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentSeoKeyword}
                    onChange={(e) => setCurrentSeoKeyword(e.target.value)}
                    placeholder="Add SEO keywords..."
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSeoKeyword())}
                  />
                  <Button type="button" onClick={addSeoKeyword}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.seo_keywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="gap-1">
                      {keyword}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => removeSeoKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createCampaignMutation.isPending}
            >
              {createCampaignMutation.isPending ? 'Creating...' : 'Create Campaign'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};