
import React from 'react';
import { HelpContent } from '@/types/help';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, BookOpen } from 'lucide-react';

interface HelpContentTextProps {
  content: HelpContent;
}

export const HelpContentText: React.FC<HelpContentTextProps> = ({ content }) => {
  return (
    <div className="space-y-4">
      <Card className="border-primary/20">
        <CardContent className="p-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-muted-foreground mb-6 text-base">{content.description}</p>
            
            {(content.textContent || (content as any).content) ? (
              <div className="whitespace-pre-wrap text-foreground leading-relaxed text-base bg-muted/30 p-4 rounded-lg">
                {content.textContent || (content as any).content}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <BookOpen className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p>This help topic is being prepared. Please check back later or contact support if you need immediate assistance.</p>
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
