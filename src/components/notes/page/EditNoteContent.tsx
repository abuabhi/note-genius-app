import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { useOptimizedNotes } from "@/contexts/OptimizedNotesContext";
import { Note } from "@/types/note";

const EditNoteContent = () => {
  const { noteId } = useParams();
  const { notes, updateNote } = useOptimizedNotes();
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<Note | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (notes.length > 0 && noteId) {
      const foundNote = notes.find((n) => n.id === noteId);
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        setDescription(foundNote.description);
        setContent(foundNote.content);
      }
      setLoading(false);
    }
  }, [notes, noteId]);

  const handleSave = async () => {
    if (note && noteId) {
      try {
        await updateNote(noteId, {
          title,
          description,
          content,
        });
        navigate(`/notes/${noteId}`);
      } catch (error) {
        console.error("Error updating note:", error);
      }
    }
  };

  if (loading || !note) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <Button variant="ghost" onClick={() => navigate(`/notes/${noteId}`)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Note
        </Button>
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Note</h1>
      </div>
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="title"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-medium text-gray-700">
          Content
        </label>
        <textarea
          id="content"
          rows={10}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>
      <div>
        <Button variant="primary" onClick={handleSave}>
          <Save className="mr-2 h-4 w-4" />
          Save Note
        </Button>
      </div>
    </div>
  );
};

export default EditNoteContent;
