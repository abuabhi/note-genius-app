
import React from 'react';
import { Check } from 'lucide-react';

interface FeatureListProps {
  features: string[];
}

export const FeatureList: React.FC<FeatureListProps> = ({ features }) => {
  return (
    <ul className="space-y-4 text-left">
      {features.map((feature, idx) => (
        <li key={idx} className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <Check className="h-5 w-5 text-mint-500" />
          </div>
          <span className="text-gray-700 leading-relaxed">{feature}</span>
        </li>
      ))}
    </ul>
  );
};
