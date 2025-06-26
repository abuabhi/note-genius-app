
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useCreateStudyPlan } from '@/hooks/useCreateStudyPlan';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { StudyPlanFormValues } from '@/types/studyPlanner';
import { toast } from 'sonner';

interface CreateStudyPlanFormProps {
  open: boolean;
  onClose: () => void;
}

export const CreateStudyPlanForm = ({ open, onClose }: CreateStudyPlanFormProps) => {
  const { createStudyPlan, isLoading } = useCreateStudyPlan();
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  
  const [formData, setFormData] = useState<StudyPlanFormValues>({
    title: '',
    subject: '',
    topic: '',
    hoursPerDay: 1,
    startDate: '',
    endDate: '',
    studyDays: [],
  });

  const studyDayOptions = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createStudyPlan(formData);
      toast.success('Study plan created successfully!');
      onClose();
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Study Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter study plan title"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subject">Subject</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder={subjectsLoading ? "Loading subjects..." : "Select subject"} />
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

              <div>
                <Label htmlFor="topic">Topic</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Enter topic"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="hoursPerDay">Hours Per Day</Label>
              <Input
                id="hoursPerDay"
                type="number"
                min="0.5"
                max="12"
                step="0.5"
                value={formData.hoursPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, hoursPerDay: parseFloat(e.target.value) }))}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  required
                />
              </div>

              <div>
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div>
              <Label>Study Days</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {studyDayOptions.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={formData.studyDays.includes(day.id)}
                      onCheckedChange={(checked) => handleStudyDayChange(day.id, checked as boolean)}
                    />
                    <Label htmlFor={day.id} className="text-sm font-normal">
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || subjectsLoading}>
              {isLoading ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
