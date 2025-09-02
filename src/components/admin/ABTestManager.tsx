import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useVideoABTests, useCreateABTest, useUpdateABTest } from '@/hooks/admin/useVideoAnalytics';
import { Plus, Play, Pause, BarChart3, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

const videoSections = [
  'video_hero_url',
  'video_notes_import_url', 
  'video_flashcard_generation_url',
  'video_smart_quizzes_url',
  'video_ai_chat_url',
  'video_study_plans_url',
  'video_todo_focus_url',
  'video_analytics_url',
  'video_timer_url',
  'video_goals_progress_url',
  'video_resources_url'
];

export const ABTestManager = () => {
  const { data: abTests = [], isLoading } = useVideoABTests();
  const createABTest = useCreateABTest();
  const updateABTest = useUpdateABTest();
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newTest, setNewTest] = useState({
    video_key: '',
    variant_name: '',
    video_url: '',
    traffic_percentage: 50
  });

  const handleCreateTest = async () => {
    if (!newTest.video_key || !newTest.variant_name || !newTest.video_url) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createABTest.mutateAsync(newTest);
      setNewTest({ video_key: '', variant_name: '', video_url: '', traffic_percentage: 50 });
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create A/B test:', error);
    }
  };

  const toggleTestStatus = async (testId: string, currentStatus: boolean) => {
    try {
      await updateABTest.mutateAsync({
        id: testId,
        updates: { is_active: !currentStatus }
      });
    } catch (error) {
      console.error('Failed to toggle test status:', error);
    }
  };

  const groupedTests = abTests.reduce((acc, test) => {
    if (!acc[test.video_key]) {
      acc[test.video_key] = [];
    }
    acc[test.video_key].push(test);
    return acc;
  }, {} as Record<string, typeof abTests>);

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="py-6">
              <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
              <div className="h-2 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">A/B Test Manager</h3>
          <p className="text-sm text-muted-foreground">
            Test different videos to optimize conversion rates
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create A/B Test
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New A/B Test</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="video_key">Video Section</Label>
                <Select value={newTest.video_key} onValueChange={(value) => 
                  setNewTest(prev => ({ ...prev, video_key: value }))
                }>
                  <SelectTrigger>
                    <SelectValue placeholder="Select video section" />
                  </SelectTrigger>
                  <SelectContent>
                    {videoSections.map(section => (
                      <SelectItem key={section} value={section}>
                        {section.replace('video_', '').replace('_url', '').replace(/_/g, ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="variant_name">Variant Name</Label>
                <Input 
                  id="variant_name"
                  value={newTest.variant_name}
                  onChange={(e) => setNewTest(prev => ({ ...prev, variant_name: e.target.value }))}
                  placeholder="e.g., Version A, New Demo, etc."
                />
              </div>

              <div>
                <Label htmlFor="video_url">Video URL</Label>
                <Input 
                  id="video_url"
                  value={newTest.video_url}
                  onChange={(e) => setNewTest(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <Label>Traffic Split: {newTest.traffic_percentage}%</Label>
                <Slider
                  value={[newTest.traffic_percentage]}
                  onValueChange={([value]) => 
                    setNewTest(prev => ({ ...prev, traffic_percentage: value }))
                  }
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percentage of users who will see this variant
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handleCreateTest}
                  disabled={createABTest.isPending}
                  className="flex-1"
                >
                  {createABTest.isPending ? 'Creating...' : 'Create Test'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {Object.entries(groupedTests).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedTests).map(([videoKey, tests]) => (
            <Card key={videoKey}>
              <CardHeader>
                <CardTitle className="text-lg">
                  {videoKey.replace('video_', '').replace('_url', '').replace(/_/g, ' ')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {tests.map((test) => (
                    <div key={test.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{test.variant_name}</h4>
                        <div className="flex items-center gap-2">
                          <Badge variant={test.is_active ? "default" : "secondary"}>
                            {test.is_active ? 'Active' : 'Paused'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleTestStatus(test.id, test.is_active)}
                          >
                            {test.is_active ? 
                              <Pause className="h-4 w-4" /> : 
                              <Play className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-muted-foreground">Traffic</p>
                          <p className="font-semibold">{test.traffic_percentage}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Views</p>
                          <p className="font-semibold">{test.total_views}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Conversion</p>
                          <p className="font-semibold">{test.conversion_rate.toFixed(2)}%</p>
                        </div>
                      </div>

                      {test.total_views > 0 && (
                        <div className="flex items-center gap-1 text-xs">
                          {test.conversion_rate > 3 ? (
                            <>
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              <span className="text-green-600">Performing well</span>
                            </>
                          ) : (
                            <>
                              <BarChart3 className="h-3 w-3 text-amber-500" />
                              <span className="text-amber-600">Needs more data</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No A/B Tests Yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first A/B test to optimize video performance and conversion rates.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Your First Test
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};