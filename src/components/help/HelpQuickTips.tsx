
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Lightbulb, CheckCircle } from 'lucide-react';

interface HelpQuickTipsProps {
  tips: string[];
}

export const HelpQuickTips: React.FC<HelpQuickTipsProps> = ({ tips }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Quick Tips</h3>
        </div>
        
        <div className="space-y-3">
          {tips.map((tip, index) => (
            <div key={index} className="flex items-start gap-3">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">{tip}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
