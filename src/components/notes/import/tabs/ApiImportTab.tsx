
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
    <div className="space-y-4">
      <Card className="border border-mint-200 bg-mint-50">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-12 h-12 bg-mint-100 rounded-full flex items-center justify-center mb-2">
            <Globe className="h-6 w-6 text-mint-600" />
          </div>
          <CardTitle className="text-mint-800 text-lg">Import from Online Services</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <ApiImport onImport={handleImport} />
        </CardContent>
      </Card>
    </div>
  );
};
