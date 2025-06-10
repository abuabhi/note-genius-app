
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Clock, Video, FileText, Zap, Sparkles } from 'lucide-react';

interface YouTubeImportTabProps {
  onImport: (noteData: any) => void;
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  return (
    <div className="space-y-6">
      {/* Coming Soon Notice */}
      <Card className="bg-amber-50 border border-amber-200">
        <CardContent className="p-4">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 text-amber-700">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Coming Soon</span>
            </div>
            <p className="text-sm text-amber-700">
              YouTube video transcription is currently in development.
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Features Preview */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-mint-500" />
          <h4 className="text-sm font-medium text-gray-900">Planned Features:</h4>
        </div>
        
        <div className="grid gap-2">
          {[
            { icon: Video, text: "Import transcripts from YouTube videos" },
            { icon: Sparkles, text: "Automatic content enhancement and formatting" },
            { icon: FileText, text: "Smart categorization and tagging" },
            { icon: Zap, text: "Integration with automation workflow" }
          ].map((feature, index) => (
            <div 
              key={index}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
            >
              <div className="p-1.5 bg-mint-50 rounded-md">
                <feature.icon className="h-3.5 w-3.5 text-mint-600" />
              </div>
              <span className="text-sm text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
