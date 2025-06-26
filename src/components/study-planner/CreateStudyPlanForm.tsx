import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Checkbox } from "@/components/ui/checkbox"
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { StudyPlanFormValues } from '@/types/studyPlanner';
import { toast } from 'sonner';
import { useCreateStudyPlan } from '@/hooks/useCreateStudyPlan';

interface CreateStudyPlanFormProps {
  open: boolean;
  onClose: () => void;
}

export const CreateStudyPlanForm = ({ open, onClose }: CreateStudyPlanFormProps) => {
  const { subjects, isLoading: isLoadingSubjects } = useUserSubjects();
  const { createStudyPlan, isLoading: isCreating } = useCreateStudyPlan();

  const [formData, setFormData] = useState<StudyPlanFormValues>({
    title: '',
    subject: '',
    topic: '',
    hoursPerDay: 1,
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    sessionDuration: 50,
    breakDuration: 10,
    maxSessionsPerDay: 3,
    studyDays: ['Mon', 'Wed', 'Fri'],
    preferredTimes: ['9:00', '14:00'],
  });

  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    setFormData(prev => ({ ...prev, startDate: date ? format(date, 'yyyy-MM-dd') : '' }));
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createStudyPlan(formData);
      toast.success('Study plan created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create study plan.');
      console.error(error);
    }
  };

  const handleStudyDaysChange = (day: string) => {
    setFormData(prev => {
      const newStudyDays = prev.studyDays.includes(day)
        ? prev.studyDays.filter(d => d !== day)
        : [...prev.studyDays, day];
      return { ...prev, studyDays: newStudyDays };
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-3xl bg-white border-0 shadow-2xl p-0">
        <div className="p-8">
          <DialogHeader className="mb-8">
            <DialogTitle className="text-2xl font-bold text-gray-900">
              Create Study Plan
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-medium text-gray-700 mb-2 block">
                Plan Title
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Mathematics Final Exam Preparation"
                className="h-12 text-base border-gray-300 focus:border-mint-500 focus:ring-mint-500"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="subject" className="text-base font-medium text-gray-700 mb-2 block">
                  Subject
                </Label>
                <Select value={formData.subject} onValueChange={(value) => setFormData({ ...formData, subject: value })}>
                  <SelectTrigger className="h-12 text-base border-gray-300 focus:border-mint-500 focus:ring-mint-500">
                    <SelectValue placeholder="Select subject" />
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
                <Label htmlFor="topic" className="text-base font-medium text-gray-700 mb-2 block">
                  Topic
                </Label>
                <Input
                  id="topic"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  placeholder="e.g., Calculus, Algebra"
                  className="h-12 text-base border-gray-300 focus:border-mint-500 focus:ring-mint-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="hoursPerDay" className="text-base font-medium text-gray-700 mb-2 block">
                  Hours Per Day
                </Label>
                <Input
                  id="hoursPerDay"
                  type="number"
                  value={formData.hoursPerDay.toString()}
                  onChange={(e) => setFormData({ ...formData, hoursPerDay: parseFloat(e.target.value) })}
                  placeholder="e.g., 2"
                  className="h-12 text-base border-gray-300 focus:border-mint-500 focus:ring-mint-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="sessionDuration" className="text-base font-medium text-gray-700 mb-2 block">
                  Session Duration (minutes)
                </Label>
                <Input
                  id="sessionDuration"
                  type="number"
                  value={formData.sessionDuration.toString()}
                  onChange={(e) => setFormData({ ...formData, sessionDuration: parseInt(e.target.value) })}
                  placeholder="e.g., 50"
                  className="h-12 text-base border-gray-300 focus:border-mint-500 focus:ring-mint-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="breakDuration" className="text-base font-medium text-gray-700 mb-2 block">
                  Break Duration (minutes)
                </Label>
                <Input
                  id="breakDuration"
                  type="number"
                  value={formData.breakDuration.toString()}
                  onChange={(e) => setFormData({ ...formData, breakDuration: parseInt(e.target.value) })}
                  placeholder="e.g., 10"
                  className="h-12 text-base border-gray-300 focus:border-mint-500 focus:ring-mint-500"
                  required
                />
              </div>

              <div>
                <Label htmlFor="maxSessionsPerDay" className="text-base font-medium text-gray-700 mb-2 block">
                  Max Sessions Per Day
                </Label>
                <Input
                  id="maxSessionsPerDay"
                  type="number"
                  value={formData.maxSessionsPerDay.toString()}
                  onChange={(e) => setFormData({ ...formData, maxSessionsPerDay: parseInt(e.target.value) })}
                  placeholder="e.g., 3"
                  className="h-12 text-base border-gray-300 focus:border-mint-500 focus:ring-mint-500"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <Label htmlFor="startDate" className="text-base font-medium text-gray-700 mb-2 block">
                  Start Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full h-12 justify-start text-left font-normal text-base border-gray-300 focus:border-mint-500 focus:ring-mint-500",
                        !date && "text-muted-foreground"
                      )}
                    >
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="center" side="bottom">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <Label htmlFor="endDate" className="text-base font-medium text-gray-700 mb-2 block">
                  End Date
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  className="h-12 text-base border-gray-300 focus:border-mint-500 focus:ring-mint-500"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-medium text-gray-700 mb-2 block">
                Study Days
              </Label>
              <div className="flex flex-wrap gap-4">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={`day-${day}`}
                      checked={formData.studyDays.includes(day)}
                      onCheckedChange={() => handleStudyDaysChange(day)}
                    />
                    <Label htmlFor={`day-${day}`} className="text-sm font-medium text-gray-700">
                      {day}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isCreating} className="bg-mint-600 hover:bg-mint-700 text-white">
                {isCreating ? 'Creating...' : 'Create Plan'}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
