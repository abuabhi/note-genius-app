
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ImportServiceGrid } from "../services/ImportServiceGrid";
import { OneNoteConnection } from "../OneNoteConnection";
import { DedicatedGoogleDocsImport } from "../DedicatedGoogleDocsImport";
import { NotionConnection } from "../NotionConnection";

interface ApiImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
  onImportComplete?: () => void;
}

export const ApiImportTab = ({ onSaveNote, isPremiumUser, onImportComplete }: ApiImportTabProps) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleConnection = (accessToken: string) => {
    console.log("Connected with token:", accessToken);
  };

  const handleBackToGrid = () => {
    setSelectedService(null);
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
            onImportComplete={onImportComplete}
          />
        );
      case 'notion':
        return <NotionConnection onConnected={handleConnection} />;
      default:
        return null;
    }
  };

  // If a service is selected, show full-height dedicated interface
  if (selectedService) {
    return (
      <div className="h-full">
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
