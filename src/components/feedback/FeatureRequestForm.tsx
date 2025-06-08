
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Lightbulb } from 'lucide-react';
import { useCreateFeedback } from '@/hooks/feedback/useFeedback';

export const FeatureRequestForm = () => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const createFeedback = useCreateFeedback();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      return;
    }

    await createFeedback.mutateAsync({
      type: 'feature_request',
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Lightbulb className="h-5 w-5 text-amber-500" />
        <h3 className="text-lg font-semibold text-orange-700">Suggest a New Feature</h3>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feature-title" className="text-orange-700">
          Feature Title *
        </Label>
        <Input
          id="feature-title"
          placeholder="What feature would you like to see?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border-orange-200 focus:border-orange-400"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="feature-priority" className="text-orange-700">
          Priority Level
        </Label>
        <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
          <SelectTrigger className="border-orange-200 focus:border-orange-400">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low - Nice to have</SelectItem>
            <SelectItem value="medium">Medium - Would be helpful</SelectItem>
            <SelectItem value="high">High - Really needed</SelectItem>
            <SelectItem value="critical">Critical - Must have</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="feature-description" className="text-orange-700">
          Detailed Description
        </Label>
        <Textarea
          id="feature-description"
          placeholder="Describe the feature in detail. How would it work? How would it benefit you and other users? Include any specific requirements or examples."
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
        {createFeedback.isPending ? 'Submitting...' : 'Submit Feature Request'}
      </Button>
    </form>
  );
};
