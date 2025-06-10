
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Youtube, Clock, Zap, Info } from 'lucide-react';

interface YouTubeImportTabProps {
  onImport: (noteData: any) => void;
}

export const YouTubeImportTab = ({ onImport }: YouTubeImportTabProps) => {
  return (
    <div className="space-y-4">
      <Card className="border-2 border-dashed border-gray-300">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Youtube className="h-8 w-8 text-gray-400" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2">
            <Clock className="h-5 w-5 text-orange-500" />
            YouTube Import - Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We're working on bringing YouTube video transcription to your note-taking experience.
          </p>
          
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
              <Zap className="h-3 w-3 mr-1" />
              Powered by n8n Webhooks
            </Badge>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">What's Coming:</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Import transcripts from YouTube videos</li>
              <li>• Automatic content enhancement and formatting</li>
              <li>• Smart categorization and tagging</li>
              <li>• Integration with our n8n automation workflow</li>
            </ul>
          </div>
          
          <div className="text-sm text-gray-500">
            Stay tuned for updates! This feature will be available soon.
          </div>
        </CardContent>
      </Card>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Integration in Progress:</strong> We're building a robust transcription system 
          using n8n webhooks to provide reliable YouTube video content extraction and processing.
        </AlertDescription>
      </Alert>
    </div>
  );
};
