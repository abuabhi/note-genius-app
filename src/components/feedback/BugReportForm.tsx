
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Bug, AlertTriangle } from 'lucide-react';
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
    <div className="bg-gradient-to-br from-red-50/50 to-white rounded-lg p-6 border border-red-100">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-red-200">
        <div className="p-2 bg-gradient-to-br from-red-400 to-red-500 rounded-lg">
          <Bug className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-red-800">Report an Issue</h3>
          <p className="text-sm text-muted-foreground">Help us fix what's not working</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="bug-title" className="text-red-800 font-medium flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Issue Summary *
          </Label>
          <Input
            id="bug-title"
            placeholder="Brief description of the issue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-red-200 focus:border-red-400 focus:ring-red-400"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bug-severity" className="text-red-800 font-medium">
            Severity Level
          </Label>
          <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
            <SelectTrigger className="border-red-200 focus:border-red-400 focus:ring-red-400">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="minor">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
                  Minor - Small inconvenience
                </div>
              </SelectItem>
              <SelectItem value="major">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  Major - Impacts functionality
                </div>
              </SelectItem>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  Critical - Blocks usage
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="bug-description" className="text-red-800 font-medium">
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
            className="min-h-[150px] border-red-200 focus:border-red-400 focus:ring-red-400 bg-white"
          />
        </div>

        <Button
          type="submit"
          disabled={!title.trim() || createFeedback.isPending}
          className="w-full py-4 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Send className="h-4 w-4 mr-2" />
          {createFeedback.isPending ? 'Submitting...' : 'Submit Bug Report'}
        </Button>
      </form>
    </div>
  );
};
