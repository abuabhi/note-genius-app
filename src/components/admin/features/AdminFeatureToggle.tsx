
import React, { useState } from 'react';
import { useFeatures, Feature } from '@/contexts/FeatureContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { UserTier } from '@/hooks/useRequireAuth';
import { Loader, AlertTriangle, Info, Eye, EyeOff } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const AdminFeatureToggle = () => {
  const { features, loading, error, updateFeature, refreshFeatures } = useFeatures();
  const [updatingFeature, setUpdatingFeature] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");

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
            For disabled features, you can also choose whether they should be visible but inactive,
            or completely hidden from the user interface.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList>
          <TabsTrigger value="all">All Features</TabsTrigger>
          <TabsTrigger value="enabled">Enabled</TabsTrigger>
          <TabsTrigger value="disabled">Disabled</TabsTrigger>
          <TabsTrigger value="visible">Visible</TabsTrigger>
          <TabsTrigger value="hidden">Hidden</TabsTrigger>
        </TabsList>
      </Tabs>

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
    </div>
  );
};

export default AdminFeatureToggle;
