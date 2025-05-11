
import React from 'react';
import { useFeatures } from '@/contexts/FeatureContext';
import { UserTier } from '@/hooks/useRequireAuth';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FeatureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FeatureForm {
  feature_key: string;
  description: string;
  is_enabled: boolean;
  requires_tier: UserTier | null;
  visibility_mode: 'visible' | 'hidden';
}

export function FeatureDialog({ open, onOpenChange }: FeatureDialogProps) {
  const { refreshFeatures } = useFeatures();
  const [newFeature, setNewFeature] = React.useState<FeatureForm>({
    feature_key: '',
    description: '',
    is_enabled: true,
    requires_tier: null,
    visibility_mode: 'visible'
  });

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
      onOpenChange(false);
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleCreateFeature}>Create Feature</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
