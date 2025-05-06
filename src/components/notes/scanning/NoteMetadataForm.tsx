
import { Input } from "@/components/ui/input";

interface NoteMetadataFormProps {
  title: string;
  setTitle: (title: string) => void;
  category: string;
  setCategory: (category: string) => void;
  isDisabled: boolean;
}

export const NoteMetadataForm = ({ 
  title, 
  setTitle, 
  category, 
  setCategory,
  isDisabled 
}: NoteMetadataFormProps) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Note Title</label>
        <Input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter a title for your note"
          className="mt-1"
          disabled={isDisabled}
        />
      </div>
      
      <div>
        <label className="text-sm font-medium">Category</label>
        <Input 
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Category (e.g., Math, History)"
          className="mt-1"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
