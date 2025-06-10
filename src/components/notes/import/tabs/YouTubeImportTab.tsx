
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Clock } from 'lucide-react';

interface YouTubeImportTabProps {
  onImport: (noteData: any) => void;
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  return (
    <div className="space-y-4">
      <Card className="border border-mint-200 bg-mint-50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mb-2">
            <Youtube className="h-6 w-6 text-mint-600" />
          </div>
          <CardTitle className="text-mint-800 text-lg">YouTube Import</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-mint-700">
              <Clock className="h-5 w-5" />
              <span className="font-medium">Coming Soon</span>
            </div>
            
            <p className="text-mint-600">
              We're working on bringing YouTube video transcription to your note-taking experience.
            </p>
            
            <div className="bg-mint-100 rounded-lg p-4">
              <h4 className="font-medium text-mint-800 mb-2">What's Coming:</h4>
              <ul className="text-sm text-mint-600 space-y-1 text-left">
                <li>• Import transcripts from YouTube videos</li>
                <li>• Automatic content enhancement and formatting</li>
                <li>• Smart categorization and tagging</li>
                <li>• Integration with our automation workflow</li>
              </ul>
            </div>
            
            <div className="text-sm text-mint-500">
              Stay tuned for updates! This feature will be available soon.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
