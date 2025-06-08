
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bug } from 'lucide-react';
import { useCreateFeedback } from '@/hooks/feedback/useFeedback';

export const BugReportForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<'minor' | 'major' | 'critical'>('minor');
  const createFeedback = useCreateFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    await createFeedback.mutateAsync({
      type: 'bug_report',
      title: title.trim(),
      description: description.trim() || undefined,
      severity,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setSeverity('minor');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Bug className="h-5 w-5 text-red-500" />
        <h3 className="text-lg font-semibold text-orange-700">Report an Issue</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bug-title" className="text-orange-700">
          Issue Summary *
        </Label>
        <Input
          id="bug-title"
          placeholder="Brief description of the issue"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-orange-200 focus:border-orange-400"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bug-severity" className="text-orange-700">
          Severity Level
        </Label>
        <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
          <SelectTrigger className="border-orange-200 focus:border-orange-400">
            <SelectValue placeholder="Select severity" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="minor">Minor - Small inconvenience</SelectItem>
            <SelectItem value="major">Major - Impacts functionality</SelectItem>
            <SelectItem value="critical">Critical - Blocks usage</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bug-description" className="text-orange-700">
          Detailed Description
        </Label>
        <Textarea
          id="bug-description"
          placeholder="Please describe the issue in detail:
• What were you trying to do?
• What happened instead?
• What browser are you using?
• Can you reproduce this issue?
• Any error messages you saw?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="min-h-[150px] border-orange-200 focus:border-orange-400"
        />
      </div>

      <Button
        type="submit"
        disabled={!title.trim() || createFeedback.isPending}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium py-3"
      >
        <Send className="h-4 w-4 mr-2" />
        {createFeedback.isPending ? 'Submitting...' : 'Submit Bug Report'}
      </Button>
    </form>
  );
};
