
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { updateNoteInDatabase } from '@/contexts/notes/operations';
import { Note } from '@/types/note';
import { generateNoteSummary } from '@/hooks/noteEnrichment/enrichmentService';
import { toast } from 'sonner';

interface NoteSummaryProps {
  note?: Note;
  summary?: string;
  description?: string;
  status?: 'idle' | 'generating' | 'completed' | 'error' | 'pending' | 'failed';
  maxLength?: number;
  generateOnLoad?: boolean;
  onGenerateSummary?: () => Promise<void>;
}

type SummaryState = 'idle' | 'generating' | 'completed' | 'error';

export const NoteSummary = ({ 
  note,
  summary,
  description,
  status = 'idle',
  maxLength = 150, 
  generateOnLoad = false,
  onGenerateSummary
}: NoteSummaryProps) => {
  const [summaryText, setSummaryText] = useState(note?.summary || summary || '');
  const [summaryState, setSummaryState] = useState<SummaryState>(
    summary || note?.summary ? 'completed' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);

  // Handle the case where the component receives a note object
  const handleGenerateSummary = async () => {
    if (onGenerateSummary) {
      // Use the parent-provided generator function
      await onGenerateSummary();
      return;
    }

    if (!note) {
      console.error('No note provided for summary generation');
      return;
    }

    try {
      setSummaryState('generating');
      setError(null);

      const summaryContent = await generateNoteSummary(note);
      
      // Update in database
      await updateNoteInDatabase(note.id, {
        summary: summaryContent,
        summary_generated_at: new Date().toISOString()
      });
      
      // Update local state
      setSummaryText(summaryContent);
      setSummaryState('completed');
      note.summary = summaryContent;
      note.summary_generated_at = new Date().toISOString();
      
    } catch (err) {
      console.error('Error generating summary:', err);
      setError((err as Error).message || 'Failed to generate summary');
      setSummaryState('error');
      toast('Failed to generate summary', {
        description: 'There was an error generating the note summary.'
      });
    }
  };

  // Use status from props if provided, otherwise use internal state
  const effectiveStatus = status !== 'idle' ? status : summaryState;
  
  // Display text with truncation if needed
  const displayText = (): string => {
    const textToDisplay = summaryText || description || '';
    
    if (!textToDisplay) return '';
    
    if (textToDisplay.length <= maxLength) {
      return textToDisplay;
    }
    
    return `${textToDisplay.substring(0, maxLength - 3)}...`;
  };

  return (
    <div className="mt-2">
      {(effectiveStatus === 'completed' || effectiveStatus === 'pending') && (summaryText || description) && (
        <p className="text-sm line-clamp-3 text-muted-foreground">{displayText()}</p>
      )}
      
      {/* Show generate button when not generating and no summary exists */}
      {(effectiveStatus === 'idle' || effectiveStatus === 'error' || effectiveStatus === 'failed') && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 px-2 text-muted-foreground bg-transparent hover:bg-muted/30"
          onClick={handleGenerateSummary}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Generate summary
        </Button>
      )}
      
      {/* Loading indicator */}
      {effectiveStatus === 'generating' && (
        <div className="flex items-center text-xs text-muted-foreground">
          <div className="animate-spin h-3 w-3 border-2 border-mint-300 border-t-transparent rounded-full mr-1"></div>
          Generating summary...
        </div>
      )}
    </div>
  );
};
