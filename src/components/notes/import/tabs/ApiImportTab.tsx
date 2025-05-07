
import React from "react";
import { ApiImport } from "../ApiImport";

interface ApiImportTabProps {
  onApiImport: (type: string, content: string) => void;
  isProcessing: boolean;
}

export const ApiImportTab = ({ 
  onApiImport,
  isProcessing 
}: ApiImportTabProps) => {
  return (
    <div className="min-h-[300px]">
      <ApiImport onImport={onApiImport} />
    </div>
  );
};
