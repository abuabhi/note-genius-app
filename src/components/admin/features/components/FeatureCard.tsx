
import React, { useState } from 'react';
import { Feature, useFeatures } from '@/contexts/FeatureContext';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Eye } from 'lucide-react';
import { UserTier } from '@/hooks/useRequireAuth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface FeatureCardProps {
  feature: Feature;
}

export function FeatureCard({ feature }: FeatureCardProps) {
  const { updateFeature } = useFeatures();
  const [updatingFeature, setUpdatingFeature] = useState<string | null>(null);

  const handleToggleFeature = async () => {
    try {
      setUpdatingFeature(feature.id);
      await updateFeature(feature.id, { is_enabled: !feature.is_enabled });
    } finally {
      setUpdatingFeature(null);
    }
  };

  const handleChangeTier = async (tier: UserTier | null) => {
    try {
      setUpdatingFeature(feature.id);
      await updateFeature(feature.id, { requires_tier: tier });
    } finally {
      setUpdatingFeature(null);
    }
  };

  const handleChangeVisibility = async () => {
    try {
      setUpdatingFeature(feature.id);
      const newVisibility = feature.visibility_mode === 'visible' ? 'hidden' : 'visible';
      await updateFeature(feature.id, { visibility_mode: newVisibility });
    } finally {
      setUpdatingFeature(null);
    }
  };

  return (
    <div className="border border-border rounded-lg p-4 bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium">{feature.feature_key}</h3>
          <p className="text-sm text-muted-foreground">{feature.description}</p>
        </div>
        <Switch 
          checked={feature.is_enabled} 
          disabled={updatingFeature === feature.id}
          onCheckedChange={handleToggleFeature} 
        />
      </div>

      <div className="flex flex-col md:flex-row justify-between mt-4 items-start gap-4">
        <div className="w-full md:w-auto">
          <p className="text-sm text-muted-foreground mb-1">Minimum tier required:</p>
          <Select
            value={feature.requires_tier || "none"}
            onValueChange={(value) => {
              handleChangeTier(value === "none" ? null : value as UserTier);
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

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Visible when disabled:</span>
          <div className="flex items-center" onClick={() => !updatingFeature && handleChangeVisibility()}>
            <Eye className={`h-4 w-4 ${feature.visibility_mode === 'visible' ? 'text-green-500' : 'text-gray-300'}`} />
          </div>
          <span className={`text-xs px-2 py-1 rounded-full ${feature.is_enabled ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
            {feature.is_enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>
    </div>
  );
}
