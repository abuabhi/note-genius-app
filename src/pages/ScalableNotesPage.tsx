
import Layout from "@/components/layout/Layout";
import { ScalableNotesContent } from "@/components/notes/page/ScalableNotesContent";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { toast } from "sonner";

const ScalableNotesPage = () => {
  useRequireAuth();

  const handleSaveNote = async (noteData: any) => {
    try {
      // Handle note saving logic here
      toast.success("Note saved successfully!");
    } catch (error) {
      toast.error("Failed to save note");
    }
  };

  const handleScanNote = async () => {
    try {
      // Handle note scanning logic here
      toast.success("Note scan initiated");
    } catch (error) {
      toast.error("Failed to scan note");
    }
  };

  const handleImportNote = async () => {
    try {
      // Handle note import logic here
      toast.success("Note import initiated");
    } catch (error) {
      toast.error("Failed to import note");
    }
  };

  return (
    <Layout>
      <ScalableNotesContent 
        onSaveNote={handleSaveNote}
        onScanNote={handleScanNote}
        onImportNote={handleImportNote}
      />
    </Layout>
  );
};

export default ScalableNotesPage;
