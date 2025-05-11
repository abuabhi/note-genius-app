
import React, { useState, useEffect } from 'react';
import { useFeatures, Feature } from '@/contexts/FeatureContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { UserTier } from '@/hooks/useRequireAuth';
import { Loader, AlertTriangle, Info, Eye, EyeOff, Plus, RefreshCw } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// All required features that should exist
const REQUIRED_FEATURES = [
  { key: "goals", description: "Goal setting and tracking" },
  { key: "todos", description: "Todo list management" },
  { key: "study_sessions", description: "Study session tracking" },
  { key: "progress", description: "Progress tracking and analytics" },
  { key: "quizzes", description: "Quiz creation and taking" },
  { key: "flashcards", description: "Flashcards creation and study" },
  { key: "schedule", description: "Calendar and scheduling" },
  { key: "chat", description: "AI chat assistant" },
  { key: "collaboration", description: "Collaboration with other users" },
  { key: "import", description: "Import from external services" }
];

const AdminFeatureToggle = () => {
  const { features, loading, error, updateFeature, refreshFeatures } = useFeatures();
  const [updatingFeature, setUpdatingFeature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);
  const [newFeature, setNewFeature] = useState<{
    feature_key: string;
    description: string;
    is_enabled: boolean;
    requires_tier: UserTier | null;
    visibility_mode: 'visible' | 'hidden';
  }>({
    feature_key: '',
    description: '',
    is_enabled: true,
    requires_tier: null,
    visibility_mode: 'visible'
  });
  const [isSyncing, setSyncing] = useState(false);

  const handleToggleFeature = async (feature: Feature) => {
    try {
      setUpdatingFeature(feature.id);
      await updateFeature(feature.id, { is_enabled: !feature.is_enabled });
    } finally {
      setUpdatingFeature(null);
    }
  };

  const handleChangeTier = async (feature: Feature, tier: UserTier | null) => {
    try {
      setUpdatingFeature(feature.id);
      await updateFeature(feature.id, { requires_tier: tier });
    } finally {
      setUpdatingFeature(null);
    }
  };

  const handleChangeVisibility = async (feature: Feature) => {
    try {
      setUpdatingFeature(feature.id);
      const newVisibility = feature.visibility_mode === 'visible' ? 'hidden' : 'visible';
      await updateFeature(feature.id, { visibility_mode: newVisibility });
    } finally {
      setUpdatingFeature(null);
    }
  };

  const getFilteredFeatures = () => {
    switch (activeTab) {
      case 'enabled':
        return features.filter(f => f.is_enabled);
      case 'disabled':
        return features.filter(f => !f.is_enabled);
      case 'visible':
        return features.filter(f => f.visibility_mode === 'visible');
      case 'hidden':
        return features.filter(f => f.visibility_mode === 'hidden');
      default:
        return features;
    }
  };

  const handleCreateFeature = async () => {
    try {
      if (!newFeature.feature_key || !newFeature.description) {
        toast.error("Please fill in all required fields");
        return;
      }

      const { data: existingFeature } = await supabase
        .from('app_features')
        .select('*')
        .eq('feature_key', newFeature.feature_key)
        .single();

      if (existingFeature) {
        toast.error("A feature with this key already exists");
        return;
      }

      const { error } = await supabase
        .from('app_features')
        .insert([newFeature]);

      if (error) throw error;

      toast.success(`Feature "${newFeature.feature_key}" created successfully`);
      setIsCreatingFeature(false);
      setNewFeature({
        feature_key: '',
        description: '',
        is_enabled: true,
        requires_tier: null,
        visibility_mode: 'visible'
      });
      
      // Refresh feature list
      await refreshFeatures();
      
    } catch (err) {
      console.error("Error creating feature:", err);
      toast.error("Failed to create feature");
    }
  };

  const syncRequiredFeatures = async () => {
    try {
      setSyncing(true);
      
      // Check each required feature
      for (const reqFeature of REQUIRED_FEATURES) {
        const { data: existing } = await supabase
          .from('app_features')
          .select('*')
          .eq('feature_key', reqFeature.key)
          .single();
          
        if (!existing) {
          // Feature doesn't exist, create it
          const { error } = await supabase
            .from('app_features')
            .insert([{
              feature_key: reqFeature.key,
              description: reqFeature.description,
              is_enabled: false,
              visibility_mode: 'visible'
            }]);
            
          if (error) throw error;
        }
      }
      
      toast.success("Features synchronized successfully");
      await refreshFeatures();
    } catch (err) {
      console.error("Error syncing features:", err);
      toast.error("Failed to sync features");
    } finally {
      setSyncing(false);
    }
  };

  const getMissingFeatures = () => {
    const existingKeys = features.map(f => f.feature_key);
    return REQUIRED_FEATURES.filter(rf => !existingKeys.includes(rf.key)).length;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader className="h-8 w-8 animate-spin mb-4" />
        <p className="text-muted-foreground">Loading features...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>Failed to load features: {error.message}</AlertDescription>
      </Alert>
    );
  }

  const missingFeaturesCount = getMissingFeatures();

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Use these toggles to enable or disable features across the application.
            For disabled features, you can also choose whether they should be visible but inactive,
            or completely hidden from the user interface.
          </AlertDescription>
        </Alert>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Features</TabsTrigger>
            <TabsTrigger value="enabled">Enabled</TabsTrigger>
            <TabsTrigger value="disabled">Disabled</TabsTrigger>
            <TabsTrigger value="visible">Visible</TabsTrigger>
            <TabsTrigger value="hidden">Hidden</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex gap-2">
          {missingFeaturesCount > 0 && (
            <Button 
              variant="outline" 
              onClick={syncRequiredFeatures} 
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              {isSyncing ? <Loader className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Sync Missing Features ({missingFeaturesCount})
            </Button>
          )}
          
          <Button 
            onClick={() => setIsCreatingFeature(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </div>

      {getFilteredFeatures().map((feature) => (
        <Card key={feature.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-lg">{feature.feature_key}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                {updatingFeature === feature.id ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Switch
                    checked={feature.is_enabled}
                    onCheckedChange={() => handleToggleFeature(feature)}
                  />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Minimum tier required:</span>
                <Select
                  value={feature.requires_tier || "none"}
                  onValueChange={(value) => {
                    handleChangeTier(feature, value === "none" ? null : value as UserTier);
                  }}
                  disabled={updatingFeature === feature.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="No tier requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No tier requirement</SelectItem>
                    <SelectItem value={UserTier.SCHOLAR}>{UserTier.SCHOLAR}</SelectItem>
                    <SelectItem value={UserTier.GRADUATE}>{UserTier.GRADUATE}</SelectItem>
                    <SelectItem value={UserTier.MASTER}>{UserTier.MASTER}</SelectItem>
                    <SelectItem value={UserTier.DEAN}>{UserTier.DEAN}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between md:justify-end space-x-4">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground">
                    {feature.visibility_mode === 'visible' ? 'Visible when disabled' : 'Hidden when disabled'}:
                  </span>
                  <button
                    onClick={() => handleChangeVisibility(feature)}
                    className="inline-flex items-center text-slate-500 hover:text-primary"
                    disabled={updatingFeature === feature.id}
                  >
                    {feature.visibility_mode === 'visible' ? 
                      <Eye className="h-4 w-4" /> : 
                      <EyeOff className="h-4 w-4" />
                    }
                  </button>
                </div>
                
                <div>
                  {feature.is_enabled ? (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                      Enabled
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                      Disabled
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Dialog open={isCreatingFeature} onOpenChange={setIsCreatingFeature}>
        <DialogContent className="sm:max-w-[475px]">
          <DialogHeader>
            <DialogTitle>Add New Feature</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="feature_key" className="text-right">
                Feature Key*
              </Label>
              <Input
                id="feature_key"
                value={newFeature.feature_key}
                onChange={(e) => setNewFeature({...newFeature, feature_key: e.target.value})}
                className="col-span-3"
                placeholder="e.g., advanced_analytics"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description*
              </Label>
              <Textarea
                id="description"
                value={newFeature.description}
                onChange={(e) => setNewFeature({...newFeature, description: e.target.value})}
                className="col-span-3"
                placeholder="What does this feature do?"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="is_enabled" className="text-right">
                Enabled
              </Label>
              <div className="col-span-3">
                <Switch
                  id="is_enabled"
                  checked={newFeature.is_enabled}
                  onCheckedChange={(checked) => setNewFeature({...newFeature, is_enabled: checked})}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="requires_tier" className="text-right">
                Required Tier
              </Label>
              <Select
                value={newFeature.requires_tier || "none"}
                onValueChange={(value) => {
                  setNewFeature({
                    ...newFeature, 
                    requires_tier: value === "none" ? null : value as UserTier
                  });
                }}
              >
                <SelectTrigger id="requires_tier" className="col-span-3">
                  <SelectValue placeholder="No tier requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No tier requirement</SelectItem>
                  <SelectItem value={UserTier.SCHOLAR}>{UserTier.SCHOLAR}</SelectItem>
                  <SelectItem value={UserTier.GRADUATE}>{UserTier.GRADUATE}</SelectItem>
                  <SelectItem value={UserTier.MASTER}>{UserTier.MASTER}</SelectItem>
                  <SelectItem value={UserTier.DEAN}>{UserTier.DEAN}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="visibility_mode" className="text-right">
                Visibility When Disabled
              </Label>
              <Select
                value={newFeature.visibility_mode}
                onValueChange={(value: 'visible' | 'hidden') => {
                  setNewFeature({...newFeature, visibility_mode: value});
                }}
              >
                <SelectTrigger id="visibility_mode" className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visible">Visible (Show but inactive)</SelectItem>
                  <SelectItem value="hidden">Hidden (Don't show)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreatingFeature(false)}>Cancel</Button>
            <Button onClick={handleCreateFeature}>Create Feature</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminFeatureToggle;
