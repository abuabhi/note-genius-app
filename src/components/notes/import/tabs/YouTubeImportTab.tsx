
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Youtube, Clock } from 'lucide-react';

interface YouTubeImportTabProps {
  onImport: (noteData: any) => void;
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-border">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Youtube className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-foreground">
            <Clock className="h-5 w-5 text-primary" />
            YouTube Import - Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We're working on bringing YouTube video transcription to your note-taking experience.
          </p>
          
          <div className="bg-muted rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-2">What's Coming:</h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Import transcripts from YouTube videos</li>
              <li>• Automatic content enhancement and formatting</li>
              <li>• Smart categorization and tagging</li>
              <li>• Integration with our automation workflow</li>
            </ul>
          </div>
          
          <div className="text-sm text-muted-foreground">
            Stay tuned for updates! This feature will be available soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
