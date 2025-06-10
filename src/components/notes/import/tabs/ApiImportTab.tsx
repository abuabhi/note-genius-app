
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
    <div className="space-y-4">
      <Card className="border border-mint-200 bg-mint-50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mb-2">
            <Globe className="h-6 w-6 text-mint-600" />
          </div>
          <CardTitle className="text-mint-800 text-lg">Online Services</CardTitle>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          <p className="text-center text-mint-600 text-sm">Select a service to import notes from:</p>
          
          <ImportServiceGrid 
            selectedService={selectedService}
            onSelectService={setSelectedService}
          />
          
          {selectedService && (
            <div className="mt-4">
              {renderServiceConnection()}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
