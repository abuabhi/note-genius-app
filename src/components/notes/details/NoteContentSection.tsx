
import { useState } from 'react';
import { Copy, Edit, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EnhanceNoteButton } from '../enrichment/EnhanceNoteButton';
import { toast } from 'sonner';

interface NoteContentSectionProps {
  noteId: string;
  noteTitle: string;
  content: string;
  onContentChange: (content: string) => void;
  onApplyEnhancement: (enhancedContent: string) => void;
}

export const NoteContentSection = ({
  noteId,
  noteTitle,
  content,
  onContentChange,
  onApplyEnhancement
}: NoteContentSectionProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableContent, setEditableContent] = useState(content);

  const handleCopyContent = () => {
    if (content) {
      navigator.clipboard.writeText(content);
      toast("Content copied to clipboard");
    }
  };

  const toggleEditing = () => {
    if (isEditing) {
      // Save changes
      onContentChange(editableContent);
      toast("Content updated");
    } else {
      // Start editing - initialize with current content
      setEditableContent(content);
    }
    setIsEditing(!isEditing);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditableContent(e.target.value);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Content</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleCopyContent} title="Copy content">
            <Copy className="h-4 w-4" />
          </Button>
          <Button 
            variant={isEditing ? "default" : "ghost"} 
            size="icon" 
            onClick={toggleEditing}
            title={isEditing ? "Save changes" : "Edit content"}
            className={isEditing ? "bg-mint-600 hover:bg-mint-700" : ""}
          >
            {isEditing ? <Save className="h-4 w-4" /> : <Edit className="h-4 w-4" />}
          </Button>
          <EnhanceNoteButton 
            noteId={noteId}
            noteTitle={noteTitle}
            noteContent={content}
            onEnhance={onApplyEnhancement}
          />
        </div>
      </div>
      <Textarea
        value={isEditing ? editableContent : content}
        onChange={handleContentChange}
        className="min-h-[200px] font-mono border-mint-200 focus-visible:ring-mint-400"
        readOnly={!isEditing}
      />
    </div>
  );
};
