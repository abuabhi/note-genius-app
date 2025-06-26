
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useCreateStudyPlan } from '@/hooks/useCreateStudyPlan';
import { StudyPlanFormValues } from '@/types/studyPlanner';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { toast } from 'sonner';

interface CreateStudyPlanFormProps {
  open: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

export const CreateStudyPlanForm = ({ open, onClose }: CreateStudyPlanFormProps) => {
  const { createStudyPlan, isLoading } = useCreateStudyPlan();
  const { subjects } = useUserSubjects();
  
  const [formData, setFormData] = useState<StudyPlanFormValues>({
    title: '',
    subject: '',
    topic: '',
    hoursPerDay: 1,
    startDate: '',
    endDate: '',
    studyDays: [],
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);

  const handleInputChange = (field: keyof StudyPlanFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDayToggle = (dayId: string) => {
    setFormData(prev => ({
      ...prev,
      studyDays: prev.studyDays.includes(dayId)
        ? prev.studyDays.filter(d => d !== dayId)
        : [...prev.studyDays, dayId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject');
      return;
    }
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }
    
    if (formData.studyDays.length === 0) {
      toast.error('Please select at least one study day');
      return;
    }

    try {
      await createStudyPlan(formData);
      toast.success('Study plan created successfully!');
      onClose();
      // Reset form
      setFormData({
        title: '',
        subject: '',
        topic: '',
        hoursPerDay: 1,
        startDate: '',
        endDate: '',
        studyDays: [],
      });
    } catch (error) {
      toast.error('Failed to create study plan');
      console.error('Error creating study plan:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-mint-800">
            Create Study Plan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium">
              Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="Enter study plan title"
              className="w-full"
            />
          </div>

          {/* Subject and Topic - Same Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject" className="text-sm font-medium">
                Subject *
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => handleInputChange('subject', e.target.value)}
                placeholder="Enter subject"
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium">
                Topic
              </Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                placeholder="Enter topic"
                className="w-full"
              />
            </div>
          </div>

          {/* Hours Per Day */}
          <div className="space-y-2">
            <Label htmlFor="hoursPerDay" className="text-sm font-medium">
              Hours Per Day *
            </Label>
            <Input
              id="hoursPerDay"
              type="number"
              min="0.5"
              max="12"
              step="0.5"
              value={formData.hoursPerDay}
              onChange={(e) => handleInputChange('hoursPerDay', parseFloat(e.target.value) || 1)}
              className="w-full"
            />
          </div>

          {/* Start Date and End Date - Same Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Start Date *</Label>
              <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(new Date(formData.startDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.startDate ? new Date(formData.startDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange('startDate', format(date, 'yyyy-MM-dd'));
                        setStartDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">End Date *</Label>
              <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.endDate ? format(new Date(formData.endDate), "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.endDate ? new Date(formData.endDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange('endDate', format(date, 'yyyy-MM-dd'));
                        setEndDateOpen(false);
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Study Days */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Study Days *</Label>
            <div className="grid grid-cols-4 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={formData.studyDays.includes(day.id)}
                    onCheckedChange={() => handleDayToggle(day.id)}
                  />
                  <Label htmlFor={day.id} className="text-sm">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-mint-600 hover:bg-mint-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Plan'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
