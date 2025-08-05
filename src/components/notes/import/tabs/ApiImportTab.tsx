
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ImportServiceGrid } from "../services/ImportServiceGrid";
import { OneNoteConnection } from "../OneNoteConnection";
import { DedicatedGoogleDocsImport } from "../DedicatedGoogleDocsImport";


interface ApiImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
  onImportComplete?: () => void;
  onAuthStart?: () => void;
  onAuthEnd?: () => void;
}

export const ApiImportTab = ({ onSaveNote, isPremiumUser, onImportComplete, onAuthStart, onAuthEnd }: ApiImportTabProps) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleConnection = (accessToken: string) => {
    console.log("Connected with token:", accessToken);
    // Don't call onImportComplete here - only after actual import
  };

  const handleBackToGrid = () => {
    setSelectedService(null);
  };

  const handleImportComplete = () => {
    // Don't close the dialog, just refresh the notes list in the background
    // Users can keep importing more documents or close manually
    console.log('📥 [API IMPORT] Import completed, keeping dialog open for more imports');
    
    // Notify parent if callback provided but don't close dialog
    if (onImportComplete) {
      onImportComplete();
    }
  };

  const renderServiceConnection = () => {
    switch (selectedService) {
      case 'onenote':
        return <OneNoteConnection onConnected={handleConnection} />;
      case 'googledocs':
        return (
          <DedicatedGoogleDocsImport 
            onConnected={handleConnection} 
            onBack={handleBackToGrid}
            onSaveNote={onSaveNote}
            onImportComplete={handleImportComplete}
            onAuthStart={onAuthStart}
            onAuthEnd={onAuthEnd}
          />
        );
      default:
        return null;
    }
  };

  // If a service is selected, show dedicated interface
  if (selectedService) {
    return (
      <div className="space-y-6 max-h-full overflow-y-auto">
        {renderServiceConnection()}
      </div>
    );
  }

  // Show service grid when no service is selected
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-600 mb-4">
          Connect to your favorite services to import existing notes and documents
        </p>
        <ImportServiceGrid 
          selectedService={selectedService}
          onSelectService={setSelectedService}
        />
      </div>
    </div>
  );
};
