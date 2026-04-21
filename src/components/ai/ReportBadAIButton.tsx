import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

interface ReportBadAIButtonProps {
  /** What kind of AI output is being reported */
  kind: 'quiz' | 'enrichment' | 'chat' | 'flashcards';
  /** Short description / context (e.g. note id, quiz id) */
  context?: string;
  className?: string;
}

/**
 * Minimal "Report bad AI output" button.
 * Writes a row to the `feedback` table so the team can review quality issues.
 */
export const ReportBadAIButton = ({ kind, context, className }: ReportBadAIButtonProps) => {
  const { user } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleClick = async () => {
    if (!user || busy || submitted) return;
    setBusy(true);
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id,
        type: `ai_quality_${kind}`,
        title: `Bad AI output (${kind})`,
        description: context ? `Context: ${context}` : 'No additional context provided.',
        priority: 'low',
        status: 'open',
      });
      if (error) throw error;
      setSubmitted(true);
      toast.success('Thanks — we\'ll review this AI response.');
    } catch (e) {
      console.error('[ReportBadAIButton]', e);
      toast.error('Could not send report. Try again later.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={handleClick}
      disabled={busy || submitted}
      className={className}
      aria-label="Report bad AI output"
    >
      {submitted ? <Check className="h-4 w-4 mr-1" /> : <Flag className="h-4 w-4 mr-1" />}
      {submitted ? 'Reported' : 'Report'}
    </Button>
  );
};
