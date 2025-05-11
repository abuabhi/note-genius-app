
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface FeatureFiltersProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export function FeatureFilters({ activeTab, setActiveTab }: FeatureFiltersProps) {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="all">All Features</TabsTrigger>
        <TabsTrigger value="enabled">Enabled</TabsTrigger>
        <TabsTrigger value="disabled">Disabled</TabsTrigger>
        <TabsTrigger value="visible">Visible</TabsTrigger>
        <TabsTrigger value="hidden">Hidden</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
