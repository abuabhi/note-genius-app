import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Target, ChevronDown, ChevronUp, Settings as SettingsIcon } from 'lucide-react';
import { useUserSubjects } from '@/hooks/useUserSubjects';

interface GoalFormData {
  title: string;
  description?: string;
  subject: string;
  target_hours: number;
  start_date: string;
  end_date: string;
}

interface GoalFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: GoalFormData) => Promise<void>;
  initialData?: Partial<GoalFormData>;
}

export const GoalFormDialog: React.FC<GoalFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  initialData = {}
}) => {
  const [formData, setFormData] = useState<GoalFormData>({
    title: initialData.title || '',
    description: initialData.description || '',
    subject: initialData.subject || '',
    target_hours: initialData.target_hours || 10,
    start_date: initialData.start_date || new Date().toISOString().split('T')[0],
    end_date: initialData.end_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Show advanced fields only if editing an existing goal that has them set,
  // otherwise keep the form minimal for new students.
  const [showDetails, setShowDetails] = useState<boolean>(
    Boolean(initialData.description || initialData.subject || initialData.target_hours)
  );

  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  const subjectNames = subjects.map(s => s.name);
  // If the saved subject isn't in the user's current list, surface it so editing
  // doesn't silently drop the value.
  const savedSubjectMissing =
    Boolean(formData.subject) && !subjectNames.includes(formData.subject);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-mint-600" />
            Create Study Goal
          </DialogTitle>
          <DialogDescription>
            What do you want to finish, and by when?
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Goal Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g. Finish chapter 5 of Biology"
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="end_date">Due Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData(prev => ({ ...prev, end_date: e.target.value }))}
              required
            />
          </div>

          {/* Optional details — collapsed by default to keep the form approachable */}
          <button
            type="button"
            onClick={() => setShowDetails(v => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {showDetails ? 'Hide details' : 'Add details (optional)'}
          </button>

          {showDetails && (
            <div className="space-y-4 pt-1">
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe your goal..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="e.g. Biology"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_hours">Target Hours</Label>
                  <Input
                    id="target_hours"
                    type="number"
                    value={formData.target_hours}
                    onChange={(e) => setFormData(prev => ({ ...prev, target_hours: parseInt(e.target.value) || 0 }))}
                    min={1}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, start_date: e.target.value }))}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-mint-600 hover:bg-mint-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
