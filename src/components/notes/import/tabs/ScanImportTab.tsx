
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Sparkles } from "lucide-react";
import { Note } from "@/types/note";
import { ScanWorkflow } from "../../scanning/ScanWorkflow";
import { Badge } from "@/components/ui/badge";

interface ScanImportTabProps {
  onSaveNote: (note: Omit<Note, 'id'>) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ScanImportTab = ({ onSaveNote, isPremiumUser }: ScanImportTabProps) => {
  const [detectedLanguage, setDetectedLanguage] = useState<string>("eng");

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan Handwritten Notes & Documents
            {isPremiumUser && (
              <Badge variant="secondary" className="bg-mint-100 text-mint-700 ml-2">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">What you can scan:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Handwritten notes and journals</li>
                <li>• Printed documents and articles</li>
                <li>• Whiteboards and blackboards</li>
                <li>• Business cards and receipts</li>
                <li>• Screenshots with text content</li>
              </ul>
            </div>

            {isPremiumUser && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-medium text-purple-900 mb-2">Premium Features:</h4>
                <ul className="text-sm text-purple-700 space-y-1">
                  <li>• Enhanced OCR accuracy with OpenAI</li>
                  <li>• Multi-language text recognition</li>
                  <li>• Automatic handwriting detection</li>
                  <li>• Content enhancement and formatting</li>
                </ul>
              </div>
            )}

            <ScanWorkflow 
              onSaveNote={onSaveNote}
              onClose={() => {}}
              selectedLanguage={detectedLanguage}
              setSelectedLanguage={setDetectedLanguage}
              isPremiumUser={isPremiumUser}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
