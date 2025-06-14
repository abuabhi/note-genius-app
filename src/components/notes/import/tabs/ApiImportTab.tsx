
import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ImportServiceGrid } from "../services/ImportServiceGrid";
import { OneNoteConnection } from "../OneNoteConnection";
import { GoogleDocsConnection } from "../GoogleDocsConnection";
import { NotionConnection } from "../NotionConnection";

interface ApiImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ApiImportTab = ({ onSaveNote, isPremiumUser }: ApiImportTabProps) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const handleConnection = (accessToken: string) => {
    console.log("Connected with token:", accessToken);
  };

  const renderServiceConnection = () => {
    switch (selectedService) {
      case 'onenote':
        return <OneNoteConnection onConnected={handleConnection} />;
      case 'googledocs':
        return <GoogleDocsConnection onConnected={handleConnection} />;
      case 'notion':
        return <NotionConnection onConnected={handleConnection} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 w-full">
      <div className="w-full">
        <p className="text-sm text-gray-600 mb-4">
          Connect to your favorite services to import existing notes and documents
        </p>
        <ImportServiceGrid 
          selectedService={selectedService}
          onSelectService={setSelectedService}
        />
      </div>
      
      {selectedService && (
        <div className="w-full">
          {renderServiceConnection()}
        </div>
      )}
    </div>
  );
};
