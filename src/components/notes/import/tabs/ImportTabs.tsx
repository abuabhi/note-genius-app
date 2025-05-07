
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileImportTab } from "./FileImportTab";
import { ApiImportTab } from "./ApiImportTab";

interface ImportTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onFileSelected: (file: File) => void;
  onApiImport: (type: string, content: string) => void;
  selectedFile: File | null;
  processDocument: () => Promise<void>;
  isProcessing: boolean;
}

export const ImportTabs = ({ 
  activeTab, 
  setActiveTab,
  onFileSelected,
  onApiImport,
  selectedFile,
  processDocument,
  isProcessing
}: ImportTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="file">File Import</TabsTrigger>
        <TabsTrigger value="api">API Import</TabsTrigger>
      </TabsList>
      
      <TabsContent value="file">
        <FileImportTab
          onFileSelected={onFileSelected}
          selectedFile={selectedFile}
          processDocument={processDocument}
          isProcessing={isProcessing}
        />
      </TabsContent>
      
      <TabsContent value="api">
        <ApiImportTab 
          onApiImport={onApiImport}
          isProcessing={isProcessing}
        />
      </TabsContent>
    </Tabs>
  );
};
