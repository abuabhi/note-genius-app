
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { updateNoteInDatabase } from '@/contexts/notes/operations';
import { Note } from '@/types/note';
import { generateNoteSummary } from '@/hooks/noteEnrichment/enrichmentService';
import { toast } from 'sonner';

interface NoteSummaryProps {
  note: Note;
  maxLength?: number;
  generateOnLoad?: boolean;
}

type SummaryState = 'idle' | 'generating' | 'completed' | 'error';

export const NoteSummary = ({ note, maxLength = 150, generateOnLoad = false }: NoteSummaryProps) => {
  const [summaryText, setSummaryText] = useState(note.summary || '');
  const [summaryState, setSummaryState] = useState<SummaryState>(
    note.summary ? 'completed' : 'idle'
  );
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSummary = async () => {
    try {
      setSummaryState('generating');
      setError(null);

      const summary = await generateNoteSummary(note);
      
      // Update in database
      await updateNoteInDatabase(note.id, {
        summary,
        summary_generated_at: new Date().toISOString()
      });
      
      // Update local state
      setSummaryText(summary);
      setSummaryState('completed');
      note.summary = summary;
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

  // Display text with truncation if needed
  const displayText = (): string => {
    if (!summaryText) return '';
    
    if (summaryText.length <= maxLength) {
      return summaryText;
    }
    
    return `${summaryText.substring(0, maxLength - 3)}...`;
  };

  return (
    <div className="mt-2">
      {summaryState === 'completed' && summaryText && (
        <p className="text-sm line-clamp-3 text-muted-foreground">{displayText()}</p>
      )}
      
      {/* Show generate button when not generating and no summary exists */}
      {(summaryState === 'idle' || summaryState === 'error') && (
        <Button
          variant="ghost"
          size="sm"
          className="text-xs h-7 px-2 text-muted-foreground bg-transparent hover:bg-muted/30"
          onClick={handleGenerateSummary}
          disabled={summaryState === 'generating'}
        >
          <Sparkles className="h-3 w-3 mr-1" />
          Generate summary
        </Button>
      )}
      
      {/* Loading indicator */}
      {summaryState === 'generating' && (
        <div className="flex items-center text-xs text-muted-foreground">
          <div className="animate-spin h-3 w-3 border-2 border-mint-300 border-t-transparent rounded-full mr-1"></div>
          Generating summary...
        </div>
      )}
    </div>
  );
};
