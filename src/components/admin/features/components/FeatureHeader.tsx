
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';
import { FeatureFilters } from './FeatureFilters';
import { RequiredFeaturesList } from './RequiredFeaturesList';

interface FeatureHeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onAddFeatureClick: () => void;
}

export function FeatureHeader({ activeTab, setActiveTab, onAddFeatureClick }: FeatureHeaderProps) {
  return (
    <>
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
        <FeatureFilters activeTab={activeTab} setActiveTab={setActiveTab} />
        
        <div className="flex gap-2">
          <RequiredFeaturesList />
          
          <Button 
            onClick={onAddFeatureClick}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Feature
          </Button>
        </div>
      </div>
    </>
  );
}
