
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Globe } from "lucide-react";
import { ApiImport } from "../ApiImport";

interface ApiImportTabProps {
  onSaveNote: (note: any) => Promise<boolean>;
  isPremiumUser?: boolean;
}

export const ApiImportTab = ({ onSaveNote, isPremiumUser }: ApiImportTabProps) => {
  const handleImport = (type: string, content: string) => {
    const note = {
      title: `Imported from ${type}`,
      content: content,
      date: new Date().toISOString(),
      category: "Imports",
      description: `Imported content from ${type}`,
      sourceType: "import"
    };
    onSaveNote(note);
  };

  return (
    <div className="space-y-4 h-full">
      <Card className="border border-mint-200 bg-mint-50">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mb-4">
            <Globe className="h-8 w-8 text-mint-600" />
          </div>
          <CardTitle className="text-mint-800">Import from Online Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ApiImport onImport={handleImport} />
        </CardContent>
      </Card>
    </div>
  );
};
