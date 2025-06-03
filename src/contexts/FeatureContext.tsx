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
  
  // Add error boundary for user tier
  let userTier: UserTier | undefined;
  let isUserPremium: boolean = false;
  
  try {
    const tierData = useUserTier();
    userTier = tierData.userTier;
    isUserPremium = tierData.isUserPremium;
  } catch (err) {
    console.error('Error getting user tier in FeatureContext:', err);
    userTier = UserTier.SCHOLAR; // Default fallback
    isUserPremium = false;
  }

  const fetchFeatures = async () => {
    try {
      console.log('FeatureContext: Starting to fetch features...');
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('app_features')
        .select('*')
        .order('feature_key');
      
      if (error) {
        console.error('FeatureContext: Supabase error:', error);
        throw error;
      }
      
      console.log('FeatureContext: Raw features data:', data);
      
      // Convert the data to ensure requires_tier is of the correct type
      // and visibility_mode is properly cast to the union type
      const typedFeatures: Feature[] = (data || []).map(feature => ({
        ...feature,
        // Cast the string to UserTier or null
        requires_tier: feature.requires_tier as UserTier | null,
        // Ensure visibility_mode is one of the allowed values
        visibility_mode: (feature.visibility_mode === 'hidden' ? 'hidden' : 'visible') as 'visible' | 'hidden'
      }));
      
      console.log('FeatureContext: Processed features:', typedFeatures);
      setFeatures(typedFeatures);
    } catch (err) {
      console.error('FeatureContext: Error fetching features:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch features'));
      
      // Set fallback features for core functionality
      const fallbackFeatures: Feature[] = [
        {
          id: 'fallback-notes',
          feature_key: 'notes',
          is_enabled: true,
          requires_tier: null,
          description: 'Core note-taking feature',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility_mode: 'visible'
        },
        {
          id: 'fallback-flashcards',
          feature_key: 'flashcards',
          is_enabled: true,
          requires_tier: null,
          description: 'Core flashcard feature',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          visibility_mode: 'visible'
        }
      ];
      
      setFeatures(fallbackFeatures);
      console.log('FeatureContext: Using fallback features:', fallbackFeatures);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeatures();
  }, []);

  // Check if a feature is enabled for the current user
  const isFeatureEnabled = (featureKey: string): boolean => {
    console.log(`FeatureContext: Checking if feature '${featureKey}' is enabled...`);
    
    // Find the feature by key
    const feature = features.find(f => f.feature_key === featureKey);
    console.log(`FeatureContext: Found feature for '${featureKey}':`, feature);
    
    // If feature doesn't exist or is disabled globally, it's not available
    if (!feature || !feature.is_enabled) {
      console.log(`FeatureContext: Feature '${featureKey}' not enabled:`, { exists: !!feature, enabled: feature?.is_enabled });
      return false;
    }
    
    // If feature has no tier requirement, it's available to all
    if (!feature.requires_tier) {
      console.log(`FeatureContext: Feature '${featureKey}' has no tier requirement, allowing access`);
      return true;
    }
    
    // Check if user meets the required tier
    if (!userTier) {
      console.log(`FeatureContext: No user tier available for feature '${featureKey}'`);
      return false;
    }
    
    const tierLevels = {
      'SCHOLAR': 1,
      'GRADUATE': 2,
      'MASTER': 3,
      'DEAN': 4
    };
    
    const userTierLevel = tierLevels[userTier];
    const requiredTierLevel = tierLevels[feature.requires_tier];
    
    const hasAccess = userTierLevel >= requiredTierLevel;
    console.log(`FeatureContext: Tier check for '${featureKey}':`, {
      userTier,
      userTierLevel,
      requiredTier: feature.requires_tier,
      requiredTierLevel,
      hasAccess
    });
    
    return hasAccess;
  };
  
  // Check if a feature should be visible in the UI
  const isFeatureVisible = (featureKey: string): boolean => {
    console.log(`FeatureContext: Checking if feature '${featureKey}' is visible...`);
    
    const feature = features.find(f => f.feature_key === featureKey);
    
    // If feature doesn't exist, it's not visible
    if (!feature) {
      console.log(`FeatureContext: Feature '${featureKey}' doesn't exist, not visible`);
      return false;
    }
    
    // If feature is explicitly set to hidden, it's not visible
    if (feature.visibility_mode === 'hidden') {
      console.log(`FeatureContext: Feature '${featureKey}' is hidden`);
      return false;
    }
    
    // Otherwise, it's visible (even if disabled)
    console.log(`FeatureContext: Feature '${featureKey}' is visible`);
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

  const contextValue = { 
    features, 
    loading, 
    error, 
    isFeatureEnabled,
    isFeatureVisible,
    updateFeature,
    refreshFeatures: fetchFeatures 
  };

  console.log('FeatureContext: Providing context value:', {
    featuresCount: features.length,
    loading,
    error: error?.message,
    userTier,
    isUserPremium
  });

  return (
    <FeatureContext.Provider value={contextValue}>
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
