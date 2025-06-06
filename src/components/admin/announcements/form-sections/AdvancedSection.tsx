
import React from 'react';
import { Control } from 'react-hook-form';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { CallToActionSection } from './CallToActionSection';
import { StylingSection } from './StylingSection';
import { TargetingSection } from './TargetingSection';
import { SettingsSection } from './SettingsSection';
import { AnnouncementFormData } from '../types';

interface AdvancedSectionProps {
  control: Control<AnnouncementFormData>;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AdvancedSection = ({ control, isOpen, onOpenChange }: AdvancedSectionProps) => {
  return (
    <Collapsible open={isOpen} onOpenChange={onOpenChange}>
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full justify-between">
          Advanced Settings
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-6 pt-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">Call to Action</h3>
            <CallToActionSection control={control} />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Styling & Layout</h3>
            <StylingSection control={control} />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Targeting</h3>
            <TargetingSection control={control} />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Additional Settings</h3>
            <SettingsSection control={control} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};
