
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
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
    // Handle the connection logic here
    // This would typically involve fetching data from the connected service
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
    <div className="space-y-6">
      <Card className="bg-white shadow-sm border border-gray-200">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-3">
            <Globe className="h-6 w-6 text-gray-600" />
          </div>
          <CardTitle className="text-gray-800 text-lg font-semibold">Online Services</CardTitle>
          <p className="text-gray-600 text-sm mt-2">
            Connect to your favorite services to import existing notes and documents
          </p>
        </CardHeader>
        <CardContent className="pt-0 space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-4">Select a service to import notes from:</p>
            <ImportServiceGrid 
              selectedService={selectedService}
              onSelectService={setSelectedService}
            />
          </div>
          
          {selectedService && (
            <div className="border-t border-gray-200 pt-6">
              {renderServiceConnection()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
