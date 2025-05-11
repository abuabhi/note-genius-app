
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileDown, FileUp } from "lucide-react";
import { ExportImportDialog } from "./export-import/ExportImportDialog";

export const ExportImportFlashcards = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"export" | "import">("export");

  const handleOpenExport = () => {
    setActiveTab("export");
    setIsOpen(true);
  };

  const handleOpenImport = () => {
    setActiveTab("import");
    setIsOpen(true);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleOpenExport}
      >
        <FileDown className="h-4 w-4" />
        <span className="hidden sm:inline">Export</span>
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="flex items-center gap-1"
        onClick={handleOpenImport}
      >
        <FileUp className="h-4 w-4" />
        <span className="hidden sm:inline">Import</span>
      </Button>

      <ExportImportDialog 
        isOpen={isOpen} 
        onOpenChange={setIsOpen}
        defaultTab={activeTab}
      />
    </div>
  );
};
