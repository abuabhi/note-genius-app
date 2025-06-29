
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Image, Monitor } from "lucide-react";

export const HeroImageGuide = () => {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          How to Change the Hero Image
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-mint-100 p-2 rounded-full">
              <Upload className="h-4 w-4 text-mint-600" />
            </div>
            <div>
              <h4 className="font-medium">1. Upload Your Image</h4>
              <p className="text-sm text-gray-600">
                In Lovable, use the file upload feature to add your new hero image. 
                It will generate a path like: <code>/lovable-uploads/your-image-id.png</code>
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-mint-100 p-2 rounded-full">
              <Monitor className="h-4 w-4 text-mint-600" />
            </div>
            <div>
              <h4 className="font-medium">2. Update the Image Path</h4>
              <p className="text-sm text-gray-600">
                Replace the current image source in <code>Hero.tsx</code>:
              </p>
              <div className="bg-gray-100 p-2 rounded mt-2 text-xs">
                <code>src="/lovable-uploads/your-new-image-id.png"</code>
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <div className="bg-mint-100 p-2 rounded-full">
              <Image className="h-4 w-4 text-mint-600" />
            </div>
            <div>
              <h4 className="font-medium">3. Recommended Specifications</h4>
              <ul className="text-sm text-gray-600 mt-1 space-y-1">
                <li>• <strong>Dimensions:</strong> 1200x800px or larger</li>
                <li>• <strong>Format:</strong> PNG or JPG</li>
                <li>• <strong>Content:</strong> Study planning interface, dashboard, or students using the app</li>
                <li>• <strong>Style:</strong> Clean, modern, matches the mint color scheme</li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-mint-50 rounded-lg">
          <p className="text-sm text-mint-700">
            <strong>Current image:</strong> Shows StudyAI dashboard with flashcards, notes, and progress tracking.
            Consider showing the new study planning features in your replacement image.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
