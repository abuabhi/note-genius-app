
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface NoteMetadataFormProps {
  title: string;
  setTitle: (title: string) => void;
  subject: string;
  setSubject: (subject: string) => void;
  isDisabled: boolean;
  detectedLanguage?: string;
  confidence?: number;
}

export const NoteMetadataForm = ({ 
  title, 
  setTitle, 
  subject, 
  setSubject,
  isDisabled,
  detectedLanguage,
  confidence
}: NoteMetadataFormProps) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Note Details</h3>
        {detectedLanguage && (
          <Badge variant="outline" className="text-xs">
            {detectedLanguage} {confidence ? `(${Math.round(confidence * 100)}%)` : ''}
          </Badge>
        )}
      </div>
      
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
        <label className="text-sm font-medium">Subject</label>
        <Input 
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Subject (e.g., Mathematics, Science, History)"
          className="mt-1"
          disabled={isDisabled}
        />
      </div>
    </div>
  );
};
