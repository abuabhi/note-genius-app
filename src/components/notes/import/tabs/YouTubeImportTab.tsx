
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Clock } from 'lucide-react';

interface YouTubeImportTabProps {
  onImport: (noteData: any) => void;
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
            <Youtube className="h-6 w-6 text-gray-600" />
          </div>
          <CardTitle className="text-gray-800 text-lg font-semibold">YouTube Import</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Import video transcripts and turn them into structured notes
          </p>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center gap-3 text-amber-600 bg-amber-50 rounded-lg p-4">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">Coming Soon</span>
            </div>
            
            <p className="text-gray-600 leading-relaxed">
              We're working on bringing YouTube video transcription to your note-taking experience.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 text-left">
              <h4 className="font-semibold text-gray-800 mb-4">What's Coming:</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 mt-1">•</span>
                  Import transcripts from YouTube videos
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 mt-1">•</span>
                  Automatic content enhancement and formatting
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 mt-1">•</span>
                  Smart categorization and tagging
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-mint-500 mt-1">•</span>
                  Integration with our automation workflow
                </li>
              </ul>
            </div>
            
            <div className="text-sm text-gray-500">
              Stay tuned for updates! This feature will be available soon.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
