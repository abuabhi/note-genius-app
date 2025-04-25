
import Layout from "@/components/layout/Layout";
import { NotesGrid } from "@/components/notes/NotesGrid";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

const NotesPage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">My Notes</h1>
          <Button>
            <FileText className="mr-2 h-4 w-4" />
            New Note
          </Button>
        </div>
        <NotesGrid />
      </div>
    </Layout>
  );
};

export default NotesPage;
