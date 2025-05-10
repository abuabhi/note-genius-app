
import React, { useState } from 'react';
import { useFeatures, Feature } from '@/contexts/FeatureContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { UserTier } from '@/hooks/useRequireAuth';
import { Loader, AlertTriangle, Info } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

const AdminFeatureToggle = () => {
  const { features, loading, error, updateFeature, refreshFeatures } = useFeatures();
  const [updatingFeature, setUpdatingFeature] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Use these toggles to enable or disable features across the application.
            Disabling a feature will prevent all users from accessing it, regardless of their tier.
          </AlertDescription>
        </Alert>
      </div>

      {features.map((feature) => (
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
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-sm text-muted-foreground mr-2">Minimum tier required:</span>
                <Select
                  value={feature.requires_tier || ''}
                  onValueChange={(value) => {
                    handleChangeTier(feature, value === '' ? null : value as UserTier);
                  }}
                  disabled={updatingFeature === feature.id}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="No tier requirement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No tier requirement</SelectItem>
                    <SelectItem value={UserTier.SCHOLAR}>{UserTier.SCHOLAR}</SelectItem>
                    <SelectItem value={UserTier.GRADUATE}>{UserTier.GRADUATE}</SelectItem>
                    <SelectItem value={UserTier.MASTER}>{UserTier.MASTER}</SelectItem>
                    <SelectItem value={UserTier.DEAN}>{UserTier.DEAN}</SelectItem>
                  </SelectContent>
                </Select>
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
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default AdminFeatureToggle;
