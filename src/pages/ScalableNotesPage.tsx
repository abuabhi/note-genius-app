
import Layout from "@/components/layout/Layout";
import { OptimizedNotesContent } from "@/components/notes/page/OptimizedNotesContent";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import { toast } from "sonner";
import { Note } from "@/types/note";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { FileText, Plus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DialogManager } from "@/components/notes/page/header/DialogManager";
import { useUserTier } from "@/hooks/useUserTier";

const ScalableNotesPage = () => {
  useRequireAuth();
  const { addNote } = useOptimizedNotes();
  const { tierLimits } = useUserTier();
  
  // Dialog states
  const [isManualDialogOpen, setIsManualDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);

  const handleSaveNote = async (noteData: Omit<Note, 'id'>): Promise<Note> => {
    try {
      const savedNote = await addNote(noteData);
      if (savedNote) {
        toast.success("Note saved successfully!");
        return savedNote;
      } else {
        throw new Error("Failed to save note");
      }
    } catch (error) {
      toast.error("Failed to save note");
      throw error;
    }
  };

  const handleImportNote = async (noteData: Omit<Note, 'id'>): Promise<Note> => {
    try {
      const importedNote = await addNote({
        ...noteData,
        sourceType: 'import'
      });
      if (importedNote) {
        toast.success("Note import completed successfully!");
        return importedNote;
      } else {
        throw new Error("Failed to import note");
      }
    } catch (error) {
      toast.error("Failed to import note");
      throw error;
    }
  };

  const breadcrumbs = [
    { label: "Notes" }
  ];

  const actions = (
    <div className="flex items-center gap-2">
      <Button 
        onClick={() => setIsManualDialogOpen(true)}
        className="bg-mint-600 hover:bg-mint-700"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Note
      </Button>
      <Button 
        variant="outline"
        onClick={() => setIsImportDialogOpen(true)}
        className="border-mint-200 text-mint-700 hover:bg-mint-50"
      >
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Notes"
          description="Create, organize, and manage your study notes"
          icon={<FileText className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
          actions={actions}
        />
        
        <div className="container mx-auto px-6 py-8">
          <OptimizedNotesContent />
        </div>

        {/* Dialog Manager for note creation */}
        <DialogManager 
          onSaveNote={handleSaveNote}
          onScanNote={handleSaveNote}
          onImportNote={handleImportNote}
          tierLimits={tierLimits}
          isManualDialogOpen={isManualDialogOpen}
          isScanDialogOpen={false}
          isImportDialogOpen={isImportDialogOpen}
          isSubmitting={false}
          setIsManualDialogOpen={setIsManualDialogOpen}
          setIsScanDialogOpen={() => {}}
          setIsImportDialogOpen={setIsImportDialogOpen}
        />
      </div>
    </Layout>
  );
};

export default ScalableNotesPage;
