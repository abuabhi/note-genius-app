
import Layout from '@/components/layout/Layout';
import { NoteProvider } from '@/contexts/NoteContext';
import { NotesContent } from '@/components/notes/page/NotesContent';
import { PageBreadcrumb } from '@/components/ui/page-breadcrumb';
import { FileText } from 'lucide-react';

const NotesPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-4 md:p-6">
        <PageBreadcrumb pageName="Notes" pageIcon={<FileText className="h-3 w-3" />} />
        <NoteProvider>
          <NotesContent />
        </NoteProvider>
      </div>
    </Layout>
  );
};

export default NotesPage;
