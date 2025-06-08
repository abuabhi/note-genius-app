
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Send, Lightbulb, Sparkles } from 'lucide-react';
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
    <div className="bg-gradient-to-br from-mint-50/50 to-white rounded-lg p-6 border border-mint-100">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-mint-200">
        <div className="p-2 bg-gradient-to-br from-mint-400 to-mint-500 rounded-lg">
          <Lightbulb className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-mint-800">Suggest a New Feature</h3>
          <p className="text-sm text-muted-foreground">Help us build what you need</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="feature-title" className="text-mint-800 font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-mint-500" />
            Feature Title *
          </Label>
          <Input
            id="feature-title"
            placeholder="What feature would you like to see?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-mint-200 focus:border-mint-400 focus:ring-mint-400"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="feature-priority" className="text-mint-800 font-medium">
            Priority Level
          </Label>
          <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
            <SelectTrigger className="border-mint-200 focus:border-mint-400 focus:ring-mint-400">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400"></div>
                  Low - Nice to have
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-mint-400"></div>
                  Medium - Would be helpful
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                  High - Really needed
                </div>
              </SelectItem>
              <SelectItem value="critical">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-400"></div>
                  Critical - Must have
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="feature-description" className="text-mint-800 font-medium">
            Detailed Description
          </Label>
          <Textarea
            id="feature-description"
            placeholder="Describe the feature in detail. How would it work? How would it benefit you and other users? Include any specific requirements or examples."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[150px] border-mint-200 focus:border-mint-400 focus:ring-mint-400 bg-white"
          />
        </div>

        <Button
          type="submit"
          disabled={!title.trim() || createFeedback.isPending}
          className="w-full py-4 bg-gradient-to-r from-mint-500 to-mint-600 hover:from-mint-600 hover:to-mint-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Send className="h-4 w-4 mr-2" />
          {createFeedback.isPending ? 'Submitting...' : 'Submit Feature Request'}
        </Button>
      </form>
    </div>
  );
};
