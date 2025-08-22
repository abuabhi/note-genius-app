import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CalendarIcon, Clock, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth/useAuth';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { StudyPlan } from '@/types/studyPlanner';

interface ManualStudyTimeFormProps {
  studyPlan?: StudyPlan;
  onSuccess?: () => void;
  trigger?: React.ReactNode;
}

interface ManualStudyFormData {
  studyPlanId: string;
  title: string;
  duration: number; // in minutes
  date: Date;
  subject: string;
  topic: string;
  notes: string;
}

export const ManualStudyTimeForm: React.FC<ManualStudyTimeFormProps> = ({
  studyPlan,
  onSuccess,
  trigger
}) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<ManualStudyFormData>({
    studyPlanId: studyPlan?.id || '',
    title: studyPlan?.title || '',
    duration: 0,
    date: new Date(),
    subject: studyPlan?.subject || '',
    topic: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to add study time');
      return;
    }

    if (!formData.studyPlanId || formData.duration <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sessionData = {
        user_id: user.id,
        study_plan_id: formData.studyPlanId,
        title: `${formData.title}${formData.topic ? ` - ${formData.topic}` : ''}`,
        subject: formData.subject,
        start_time: new Date(formData.date).toISOString(),
        end_time: new Date(new Date(formData.date).getTime() + formData.duration * 60000).toISOString(),
        duration: formData.duration * 60, // Convert to seconds
        is_active: false,
        session_source: 'offline',
        manual_entry_date: format(formData.date, 'yyyy-MM-dd'),
        manual_entry_notes: formData.notes,
        manual_verified: true,
        activity_type: 'study_plan',
        notes: formData.notes
      };

      const { data, error } = await supabase
        .from('study_sessions')
        .insert(sessionData)
        .select()
        .single();

      if (error) throw error;

      // Invalidate relevant caches to update analytics
      queryClient.invalidateQueries({ 
        predicate: (query) => {
          const key = query.queryKey[0];
          return typeof key === 'string' && (
            key.includes('analytics') || 
            key.includes('study-sessions') || 
            key.includes('stats') ||
            key.includes('study-planner')
          );
        }
      });

      toast.success(`Added ${formData.duration} minutes of offline study time to ${studyPlan?.title}`);
      
      // Reset form
      setFormData({
        studyPlanId: studyPlan?.id || '',
        title: studyPlan?.title || '',
        duration: 0,
        date: new Date(),
        subject: studyPlan?.subject || '',
        topic: '',
        notes: ''
      });
      
      setIsOpen(false);
      onSuccess?.();

    } catch (error) {
      console.error('Error adding manual study time:', error);
      toast.error('Failed to add study time. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Plus className="h-4 w-4" />
      Add Offline Study Time
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Add Offline Study Time
          </DialogTitle>
          {studyPlan && (
            <p className="text-sm text-muted-foreground">
              Adding to study plan: <span className="font-medium">{studyPlan.title}</span>
            </p>
          )}
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Auto-populated fields from study plan */}
          <div className="space-y-4 p-3 bg-muted/30 rounded-lg border">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              From Study Plan
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Session Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  disabled
                  className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  disabled
                  className="bg-muted/50 text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Editable fields */}
          <div className="space-y-4">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Study Session Details
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  max="720"
                  value={formData.duration || ''}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                  placeholder="60"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Study Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.date ? format(formData.date, "MMM dd, yyyy") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formData.date}
                      onSelect={(date) => date && setFormData({ ...formData, date })}
                      disabled={(date) => date > new Date() || date < new Date("2020-01-01")}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic (Optional)</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                placeholder="e.g., Algebra equations, Essay writing, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any notes about your offline study session..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Study Time'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};