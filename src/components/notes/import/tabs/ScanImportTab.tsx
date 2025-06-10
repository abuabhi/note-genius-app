
import React from 'react';
import { ScanWorkflow } from '../../scanning/ScanWorkflow';

interface ScanImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ScanImportTab = ({ onSaveNote, isPremiumUser }: ScanImportTabProps) => {
  const [selectedLanguage, setSelectedLanguage] = React.useState("eng");

  return (
    <div className="space-y-4 h-full">
      <ScanWorkflow 
        onSaveNote={onSaveNote}
        onClose={() => {}} // This will be handled by the parent dialog
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        isPremiumUser={isPremiumUser}
      />
    </div>
  );
};
