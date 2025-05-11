
import React from 'react';
import { Loader } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FeatureHeader } from './components/FeatureHeader';
import { FeatureList } from './components/FeatureList';
import { FeatureDialog } from './components/FeatureDialog';
import { useFeatureManagement } from './hooks/useFeatureManagement';

const AdminFeatureToggle = () => {
  const {
    loading,
    error,
    activeTab,
    setActiveTab,
    filteredFeatures,
    isCreatingFeature,
    setIsCreatingFeature
  } = useFeatureManagement();

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
        <AlertDescription>Failed to load features: {error.message}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <FeatureHeader 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onAddFeatureClick={() => setIsCreatingFeature(true)}
      />

      <FeatureList features={filteredFeatures} />
      
      <FeatureDialog 
        open={isCreatingFeature} 
        onOpenChange={setIsCreatingFeature} 
      />
    </div>
  );
};

export default AdminFeatureToggle;
