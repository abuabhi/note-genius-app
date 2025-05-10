
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { NoteEnrichmentDialog } from './NoteEnrichmentDialog';
import { useUserTier } from '@/hooks/useUserTier';
import { useAuth } from '@/contexts/AuthContext';

interface EnhanceNoteButtonProps {
  noteId: string;
  noteTitle: string;
  noteContent: string;
  onEnhance: (enhancedContent: string) => void;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export const EnhanceNoteButton: React.FC<EnhanceNoteButtonProps> = ({
  noteId,
  noteTitle,
  noteContent,
  onEnhance,
  variant = "outline"
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { tierLimits } = useUserTier();
  const { user } = useAuth();
  
  // Only show the button if note enrichment is enabled for the user's tier
  // or if we're in development mode for easier testing
  const isEnabled = tierLimits?.note_enrichment_enabled || import.meta.env.DEV;
  
  if (!isEnabled || !user) {
    return null;
  }

  console.log("Rendering EnhanceNoteButton for note:", noteId);

  return (
    <>
      <Button
        type="button"
        variant={variant}
        onClick={() => setDialogOpen(true)}
        className="flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Enhance with AI
      </Button>
      
      <NoteEnrichmentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        noteId={noteId}
        noteTitle={noteTitle}
        noteContent={noteContent}
        onApplyEnhancement={onEnhance}
      />
    </>
  );
};
