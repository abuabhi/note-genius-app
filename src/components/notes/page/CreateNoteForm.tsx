
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Note } from "@/types/note";
import { SheetFooter } from "@/components/ui/sheet";
import { TagSelector } from "@/components/notes/TagSelector";

interface CreateNoteFormProps {
  onAddNote: (note: Omit<Note, 'id'>) => Promise<any>;
  onSuccess?: () => void;
}

export const CreateNoteForm = ({ onAddNote, onSuccess }: CreateNoteFormProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [tags, setTags] = useState<{ id?: string; name: string; color: string }[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  const handleAddNote = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please add a title for your note.",
        variant: "destructive",
      });
      return;
    }
    
    setIsCreating(true);
    
    const today = new Date();
    const dateString = today.toISOString().split('T')[0];
    
    const newNote: Omit<Note, 'id'> = {
      title: title,
      description: description,
      date: dateString,
      category: category,
      sourceType: 'manual',
      tags: tags,
    };
    
    const result = await onAddNote(newNote);
    
    setIsCreating(false);
    
    if (result) {
      setTitle("");
      setDescription("");
      setCategory("Uncategorized");
      setTags([]);
      
      toast({
        title: "Note Created",
        description: "Your note has been created successfully.",
      });

      if (onSuccess) {
        onSuccess();
      }
    }
  };

  return (
    <>
      <div className="space-y-4 py-4">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium">
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter note title"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="category" className="text-sm font-medium">
            Category
          </label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Enter category"
          />
        </div>
        <TagSelector 
          selectedTags={tags}
          onTagsChange={setTags}
        />
        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium">
            Description
          </label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter note description"
            rows={5}
          />
        </div>
      </div>
      <SheetFooter>
        <Button onClick={handleAddNote} disabled={isCreating}>
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Create Note
            </>
          )}
        </Button>
      </SheetFooter>
    </>
  );
};
