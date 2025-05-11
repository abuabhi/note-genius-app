
import React from 'react';
import { Feature } from '@/contexts/FeatureContext';
import { FeatureCard } from './FeatureCard';

interface FeatureListProps {
  features: Feature[];
}

export function FeatureList({ features }: FeatureListProps) {
  if (features.length === 0) {
    return (
      <div className="text-center p-6 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-muted-foreground">No features found matching the current filter</p>
      </div>
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
