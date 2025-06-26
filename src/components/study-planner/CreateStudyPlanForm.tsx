
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
    totalHours: 5,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    sessionDuration: 45,
    breakDuration: 10,
    maxSessionsPerDay: 2,
    studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    preferredTimes: ['morning']
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.subject.trim()) {
      toast.error('Please fill in required fields');
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
        totalHours: 5,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        sessionDuration: 45,
        breakDuration: 10,
        maxSessionsPerDay: 2,
        studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        preferredTimes: ['morning']
      });
    } catch (error) {
      console.error('Error creating study plan:', error);
      toast.error('Failed to create study plan');
    }
  };

  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        studyDays: [...prev.studyDays, day]
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        studyDays: prev.studyDays.filter(d => d !== day)
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-gradient-to-br from-white to-mint-50/30">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold text-mint-800">Create Study Plan</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-mint-200 shadow-sm">
            <h3 className="text-lg font-semibold text-mint-700 mb-4">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-mint-700 font-medium">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter study plan title"
                  className="border-mint-200 focus:border-mint-400 focus:ring-mint-200"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-mint-700 font-medium">Subject *</Label>
                <Select 
                  value={formData.subject} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, subject: value }))}
                >
                  <SelectTrigger className="border-mint-200 focus:border-mint-400">
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
            </div>

            <div className="mt-6">
              <Label htmlFor="description" className="text-mint-700 font-medium">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your study plan goals"
                rows={3}
                className="mt-2 border-mint-200 focus:border-mint-400 focus:ring-mint-200"
              />
            </div>
          </div>

          {/* Study Details */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-mint-200 shadow-sm">
            <h3 className="text-lg font-semibold text-mint-700 mb-4">Study Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="topic" className="text-mint-700 font-medium">Topic</Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData(prev => ({ ...prev, topic: e.target.value }))}
                  placeholder="Specific topic to focus on"
                  className="border-mint-200 focus:border-mint-400 focus:ring-mint-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalHours" className="text-mint-700 font-medium">Hours per Week</Label>
                <Input
                  id="totalHours"
                  type="number"
                  min="1"
                  max="40"
                  value={formData.totalHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, totalHours: parseInt(e.target.value) || 5 }))}
                  className="border-mint-200 focus:border-mint-400 focus:ring-mint-200"
                />
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-mint-200 shadow-sm">
            <h3 className="text-lg font-semibold text-mint-700 mb-4">Schedule</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-mint-700 font-medium">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                  className="border-mint-200 focus:border-mint-400 focus:ring-mint-200"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-mint-700 font-medium">End Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                  className="border-mint-200 focus:border-mint-400 focus:ring-mint-200"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-mint-700 font-medium">Study Days</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {daysOfWeek.map((day) => (
                  <div key={day.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.value}
                      checked={formData.studyDays.includes(day.value)}
                      onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                      className="border-mint-300 data-[state=checked]:bg-mint-600 data-[state=checked]:border-mint-600"
                    />
                    <Label htmlFor={day.value} className="text-sm font-medium text-mint-700">{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-mint-200">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-mint-300 text-mint-700 hover:bg-mint-50"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-mint-600 hover:bg-mint-700 text-white shadow-md hover:shadow-lg transition-all px-8"
            >
              {isLoading ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
