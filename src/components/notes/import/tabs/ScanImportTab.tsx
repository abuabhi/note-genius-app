
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Clock } from 'lucide-react';

interface ScanImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ScanImportTab = ({ onSaveNote, isPremiumUser }: ScanImportTabProps) => {
  return (
    <div className="space-y-4 h-full">
      <Card className="border-2 border-dashed border-mint-200 bg-mint-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mb-4">
            <Camera className="h-8 w-8 text-mint-600" />
          </div>
          <CardTitle className="flex items-center justify-center gap-2 text-mint-800">
            <Clock className="h-5 w-5 text-mint-600" />
            Document Scanning - Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-mint-700">
            We're working on bringing advanced document scanning and OCR capabilities.
          </p>
          
          <div className="bg-white rounded-lg p-4 border border-mint-200">
            <h4 className="font-medium text-mint-800 mb-2">What's Coming:</h4>
            <ul className="text-sm text-mint-600 space-y-1">
              <li>• Scan documents with your camera</li>
              <li>• Advanced OCR text recognition</li>
              <li>• Multi-language support</li>
              <li>• Batch scanning capabilities</li>
              <li>• Smart image enhancement</li>
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
