
import React from 'react';
import { Feature } from '@/contexts/FeatureContext';
import { FeatureCard } from './FeatureCard';
import { EmptyState } from '@/components/ui/empty-state';

interface FeatureListProps {
  features: Feature[];
}

export function FeatureList({ features }: FeatureListProps) {
  if (features.length === 0) {
    return (
      <EmptyState
        title="No features found"
        description="No features found matching the current filter"
        className="bg-gray-50 border border-gray-200 rounded-lg"
      />
    );
  }

  return (
    <div className="space-y-4">
      {features.map((feature) => (
        <FeatureCard key={feature.id} feature={feature} />
      ))}
    </div>
  );
}
