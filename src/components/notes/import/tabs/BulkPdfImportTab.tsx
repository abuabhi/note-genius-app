
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileStack, Clock } from 'lucide-react';

interface BulkPdfImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
}

export const BulkPdfImportTab = ({ onSaveNote }: BulkPdfImportTabProps) => {
  return (
    <div className="space-y-4 h-full">
      <Card className="border-2 border-dashed border-mint-200 bg-mint-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mb-4">
            <FileStack className="h-8 w-8 text-mint-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-mint-800">
            <Clock className="h-5 w-5 text-mint-600" />
            Bulk PDF Import - Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-mint-700">
            We're working on bringing powerful bulk PDF processing capabilities.
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-mint-200">
            <h4 className="font-medium text-mint-800 mb-2">What's Coming:</h4>
            <ul className="text-sm text-mint-600 space-y-1">
              <li>• Import multiple PDFs at once</li>
              <li>• Automatic content extraction</li>
              <li>• Smart chapter and section detection</li>
              <li>• Batch processing with progress tracking</li>
              <li>• Organized note creation</li>
            </ul>
          </div>
          
          <div className="text-sm text-mint-600">
            Stay tuned for updates! This feature will be available soon.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
