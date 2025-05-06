
import Layout from "@/components/layout/Layout";
import { NoteProvider } from "@/contexts/NoteContext";
import { NotesContent } from "@/components/notes/page/NotesContent";

const NotesPage = () => {
  return (
    <Layout>
      <NoteProvider>
        <NotesContent />
      </NoteProvider>
    </Layout>
  );
};

export default NotesPage;
