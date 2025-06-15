
import Layout from "@/components/layout/Layout";
import { OptimizedNotesContent } from "@/components/notes/page/OptimizedNotesContent";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import { toast } from "sonner";
import { Note } from "@/types/note";
import { StandardPageHeader } from "@/components/ui/StandardPageHeader";
import { FileText } from "lucide-react";

const ScalableNotesPage = () => {
  useRequireAuth();
  const { addNote } = useOptimizedNotes();

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

  const handleScanNote = async (noteData: Omit<Note, 'id'>): Promise<Note> => {
    try {
      const scannedNote = await addNote({
        ...noteData,
        sourceType: 'scan'
      });
      if (scannedNote) {
        toast.success("Note scan completed successfully!");
        return scannedNote;
      } else {
        throw new Error("Failed to save scanned note");
      }
    } catch (error) {
      toast.error("Failed to scan note");
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

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-mint-50/30 via-white to-blue-50/30">
        <StandardPageHeader
          title="Notes"
          description="Create, organize, and manage your study notes"
          icon={<FileText className="h-6 w-6 text-white" />}
          breadcrumbs={breadcrumbs}
        />
        
        <div className="container mx-auto px-6 py-8">
          <OptimizedNotesContent />
        </div>
      </div>
    </Layout>
  );
};

export default ScalableNotesPage;
