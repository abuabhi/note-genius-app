
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera } from 'lucide-react';
import { ScanWorkflow } from '../../scanning/ScanWorkflow';

interface ScanImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ScanImportTab = ({ onSaveNote, isPremiumUser }: ScanImportTabProps) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState("eng");

  return (
    <div className="space-y-4">
      <Card className="border border-mint-200 bg-mint-50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mb-2">
            <Camera className="h-6 w-6 text-mint-600" />
          </div>
          <CardTitle className="text-mint-800 text-lg">Scan Documents</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ScanWorkflow 
            onSaveNote={onSaveNote}
            onClose={() => {}}
            selectedLanguage={selectedLanguage}
            setSelectedLanguage={setSelectedLanguage}
            isPremiumUser={isPremiumUser}
          />
        </CardContent>
      </Card>
    </div>
  );
};
