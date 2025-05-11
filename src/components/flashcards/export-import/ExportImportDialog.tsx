
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExportTab } from "./ExportTab";
import { ImportTab } from "./ImportTab";
import { isPremiumTier } from "@/utils/premiumFeatures";
import { useRequireAuth } from "@/hooks/useRequireAuth";

interface ExportImportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "export" | "import";
}

export const ExportImportDialog = ({ 
  isOpen, 
  onOpenChange, 
  defaultTab = "export" 
}: ExportImportDialogProps) => {
  const [activeTab, setActiveTab] = useState<"export" | "import">(defaultTab);
  const { userProfile } = useRequireAuth();
  
  const isPremium = isPremiumTier(userProfile?.user_tier);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Export/Import Flashcards</DialogTitle>
          <DialogDescription>
            Export your flashcards to share with others or import flashcards from a file.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "export" | "import")}
          className="mt-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="import">Import</TabsTrigger>
          </TabsList>
          
          <TabsContent value="export" className="py-4">
            <ExportTab isPremium={isPremium} />
          </TabsContent>
          
          <TabsContent value="import" className="py-4">
            <ImportTab isPremium={isPremium} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
