
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe, Sparkles } from "lucide-react";
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
    <div className="space-y-8 animate-fade-in">
      <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 hover:shadow-2xl transition-all duration-500 hover:scale-[1.01] animate-scale-in group">
        <CardHeader className="text-center pb-6 relative overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-mint-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative z-10">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-mint-500 to-mint-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg animate-pulse group-hover:animate-bounce">
              <Globe className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Online Services
            </CardTitle>
            <div className="h-1 w-24 bg-gradient-to-r from-mint-500 to-mint-300 rounded-full mx-auto mt-3 animate-fade-in" />
            <p className="text-gray-600 text-base mt-4 leading-relaxed">
              Connect to your favorite services to import existing notes and documents
            </p>
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="h-5 w-5 text-mint-500" />
              <p className="text-lg font-semibold text-gray-700">Select a service to import notes from:</p>
            </div>
            <ImportServiceGrid 
              selectedService={selectedService}
              onSelectService={setSelectedService}
            />
          </div>
          
          {selectedService && (
            <div className="border-t border-gray-200/50 pt-8 animate-fade-in">
              <div className="bg-gradient-to-r from-gray-50 to-mint-50/30 rounded-xl p-6 shadow-inner">
                {renderServiceConnection()}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
