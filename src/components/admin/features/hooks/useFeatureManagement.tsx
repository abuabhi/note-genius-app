
import { useState } from 'react';
import { Feature, useFeatures } from '@/contexts/FeatureContext';

export function useFeatureManagement() {
  const { features, loading, error } = useFeatures();
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isCreatingFeature, setIsCreatingFeature] = useState(false);

  const getFilteredFeatures = (): Feature[] => {
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

  return {
    features,
    loading,
    error,
    activeTab,
    setActiveTab,
    filteredFeatures: getFilteredFeatures(),
    isCreatingFeature,
    setIsCreatingFeature
  };
}
