
import { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { EnhanceNoteButton } from '../enrichment/EnhanceNoteButton';

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
  const handleCopyContent = () => {
    if (content) {
      navigator.clipboard.writeText(content);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-medium">Content</h3>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon" onClick={handleCopyContent} title="Copy content">
            <Copy className="h-4 w-4" />
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
        value={content}
        onChange={(e) => onContentChange(e.target.value)}
        className="min-h-[200px] font-mono border-mint-200 focus-visible:ring-mint-400"
        readOnly
      />
    </div>
  );
};
