
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateStudyPlan } from '@/hooks/useCreateStudyPlan';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { StudyPlanFormValues } from '@/types/studyPlanner';
import { toast } from 'sonner';
import { X } from 'lucide-react';

interface CreateStudyPlanFormProps {
  open: boolean;
  onClose: () => void;
}

export const CreateStudyPlanForm = ({ open, onClose }: CreateStudyPlanFormProps) => {
  const { createStudyPlan, isLoading } = useCreateStudyPlan();
  const { subjects } = useUserSubjects();

  const [formData, setFormData] = useState<StudyPlanFormValues>({
    title: '',
    description: '',
    subject: '',
    topic: '',
    hoursPerDay: 2,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sessionDuration: 45,
    breakDuration: 10,
    maxSessionsPerDay: 3,
    studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    preferredTimes: ['morning']
  });

  const studyDaysOptions = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.subject) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createStudyPlan(formData);
      toast.success('Study plan created successfully!');
      onClose();
      setFormData({
        title: '',
        description: '',
        subject: '',
        topic: '',
        hoursPerDay: 2,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sessionDuration: 45,
        breakDuration: 10,
        maxSessionsPerDay: 3,
        studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        preferredTimes: ['morning']
      });
    } catch (error) {
      console.error('Error creating study plan:', error);
      toast.error('Failed to create study plan');
    }
  };

  const handleStudyDayChange = (dayId: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      studyDays: checked 
        ? [...prev.studyDays, dayId]
        : prev.studyDays.filter(day => day !== dayId)
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md p-0 gap-0">
        <DialogHeader className="p-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-gray-900">
              Create Study Plan
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-medium text-gray-700">
              Plan Title *
            </Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Mathematics Final Exam Prep"
              className="h-10"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of your study plan..."
              className="min-h-[80px] resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
              Subject *
            </Label>
            <Select value={formData.subject} onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={subject.name}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic" className="text-sm font-medium text-gray-700">
              Topic
            </Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g., Algebra, World War II"
              className="h-10"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="hoursPerDay" className="text-sm font-medium text-gray-700">
                Hours Available Per Day
              </Label>
              <Input
                id="hoursPerDay"
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursPerDay: parseFloat(e.target.value) || 0 }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionDuration" className="text-sm font-medium text-gray-700">
                Session Duration (min)
              </Label>
              <Input
                id="sessionDuration"
                type="number"
                min="15"
                max="180"
                step="15"
                value={formData.sessionDuration}
                onChange={(e) => setFormData(prev => ({ ...prev, sessionDuration: parseInt(e.target.value) || 45 }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate" className="text-sm font-medium text-gray-700">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate" className="text-sm font-medium text-gray-700">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="h-10"
              />
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Study Days
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {studyDaysOptions.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={day.id}
                    checked={formData.studyDays.includes(day.id)}
                    onCheckedChange={(checked) => handleStudyDayChange(day.id, !!checked)}
                  />
                  <Label htmlFor={day.id} className="text-sm text-gray-600 font-normal">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-mint-600 hover:bg-mint-700"
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
