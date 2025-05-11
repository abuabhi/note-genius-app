
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useUserTier } from '@/hooks/useUserTier';
import { UserTier } from '@/hooks/useRequireAuth';
import { toast } from 'sonner';

export interface Feature {
  id: string;
  feature_key: string;
  is_enabled: boolean;
  requires_tier: UserTier | null;
  description: string;
  created_at: string;
  updated_at: string;
  visibility_mode: 'visible' | 'hidden';
}

interface FeatureContextValue {
  features: Feature[];
  loading: boolean;
  error: Error | null;
  isFeatureEnabled: (featureKey: string) => boolean;
  isFeatureVisible: (featureKey: string) => boolean;
  updateFeature: (id: string, updates: Partial<Feature>) => Promise<void>;
  refreshFeatures: () => Promise<void>;
}

const FeatureContext = createContext<FeatureContextValue | undefined>(undefined);

export const FeatureProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { userTier, isUserPremium } = useUserTier();

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('app_features')
        .select('*')
        .order('feature_key');
      
      if (error) throw error;
      
      // Convert the data to ensure requires_tier is of the correct type
      // and visibility_mode is properly cast to the union type
      const typedFeatures: Feature[] = (data || []).map(feature => ({
        ...feature,
        // Cast the string to UserTier or null
        requires_tier: feature.requires_tier as UserTier | null,
        // Ensure visibility_mode is one of the allowed values
        visibility_mode: (feature.visibility_mode === 'hidden' ? 'hidden' : 'visible') as 'visible' | 'hidden'
      }));
      
      setFeatures(typedFeatures);
    } catch (err) {
      console.error('Error fetching features:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch features'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  // Check if a feature is enabled for the current user
  const isFeatureEnabled = (featureKey: string): boolean => {
    // Find the feature by key
    const feature = features.find(f => f.feature_key === featureKey);
    
    // If feature doesn't exist or is disabled globally, it's not available
    if (!feature || !feature.is_enabled) return false;
    
    // If feature has no tier requirement, it's available to all
    if (!feature.requires_tier) return true;
    
    // Check if user meets the required tier
    if (!userTier) return false;
    
    const tierLevels = {
      'SCHOLAR': 1,
      'GRADUATE': 2,
      'MASTER': 3,
      'DEAN': 4
    };
    
    const userTierLevel = tierLevels[userTier];
    const requiredTierLevel = tierLevels[feature.requires_tier];
    
    return userTierLevel >= requiredTierLevel;
  };
  
  // Check if a feature should be visible in the UI
  const isFeatureVisible = (featureKey: string): boolean => {
    const feature = features.find(f => f.feature_key === featureKey);
    // If feature doesn't exist, it's not visible
    if (!feature) return false;
    
    // If feature is explicitly set to hidden, it's not visible
    if (feature.visibility_mode === 'hidden') return false;
    
    // Otherwise, it's visible (even if disabled)
    return true;
  };

  const updateFeature = async (id: string, updates: Partial<Feature>): Promise<void> => {
    try {
      const { error } = await supabase
        .from('app_features')
        .update(updates)
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setFeatures(prevFeatures => 
        prevFeatures.map(feature => 
          feature.id === id ? { ...feature, ...updates } : feature
        )
      );
      
      toast.success('Feature updated successfully');
      
    } catch (err) {
      console.error('Error updating feature:', err);
      toast.error('Failed to update feature');
      throw err;
    }
  };

  return (
    <FeatureContext.Provider 
      value={{ 
        features, 
        loading, 
        error, 
        isFeatureEnabled,
        isFeatureVisible,
        updateFeature,
        refreshFeatures: fetchFeatures 
      }}
    >
      {children}
    </FeatureContext.Provider>
  );
};

export const useFeatures = () => {
  const context = useContext(FeatureContext);
  if (context === undefined) {
    throw new Error('useFeatures must be used within a FeatureProvider');
  }
  return context;
};

export const useFeature = (featureKey: string) => {
  const { isFeatureEnabled } = useFeatures();
  return isFeatureEnabled(featureKey);
};

export const useFeatureVisibility = (featureKey: string) => {
  const { isFeatureVisible } = useFeatures();
  return isFeatureVisible(featureKey);
};
