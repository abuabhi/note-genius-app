
import React from 'react';
import { HelpContent } from '@/types/help';
import { Card, CardContent } from '@/components/ui/card';
import { Clock } from 'lucide-react';

interface HelpContentTextProps {
  content: HelpContent;
}

export const HelpContentText: React.FC<HelpContentTextProps> = ({ content }) => {
  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-gray-600 mb-4">{content.description}</p>
            
            {content.textContent && (
              <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                {content.textContent}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {content.videoContent && (
        <Card className="bg-mint-50 border-mint-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-mint-700">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                Video available: {content.videoContent.duration}
              </span>
            </div>
            <p className="text-sm text-mint-600 mt-1">
              Switch to the Video tab for a visual walkthrough of this topic.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
