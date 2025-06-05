
import Layout from '@/components/layout/Layout';
import { NoteProvider } from '@/contexts/NoteContext';
import { NotesContent } from '@/components/notes/page/NotesContent';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { FileText } from 'lucide-react';

const NotesPage = () => {
  // Create placeholder functions for the required props
  const handleSaveNote = async (note: any) => {
    console.log('Save note:', note);
    return null;
  };

  const handleScanNote = async (note: any) => {
    console.log('Scan note:', note);
    return null;
  };

  const handleImportNote = async (note: any) => {
    console.log('Import note:', note);
    return null;
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Notes" pageIcon={<FileText className="h-3 w-3" />} />
        <NoteProvider>
          <NotesContent 
            onSaveNote={handleSaveNote}
            onScanNote={handleScanNote}
            onImportNote={handleImportNote}
          />
        </NoteProvider>
      </div>
    </Layout>
  );
};

export default NotesPage;
