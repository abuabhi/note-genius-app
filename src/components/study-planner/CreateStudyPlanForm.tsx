
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useUserSubjects } from '@/hooks/useUserSubjects';

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [dailyDurationHours, setDailyDurationHours] = useState(1);
  const [dailyDurationMinutes, setDailyDurationMinutes] = useState(0);
  const [studyDays, setStudyDays] = useState<string[]>(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
  
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !subject || !topic || !startDate || !endDate || studyDays.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Here you would implement the actual creation logic
      const studyPlanData = {
        title,
        description,
        subject,
        topic,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dailyDurationMinutes: (dailyDurationHours * 60) + dailyDurationMinutes,
        studyDays
      };
      
      console.log('Creating study plan:', studyPlanData);
      toast.success('Study plan created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create study plan');
    }
  };

  const handleDayToggle = (dayId: string) => {
    setStudyDays(prev => 
      prev.includes(dayId) 
        ? prev.filter(d => d !== dayId)
        : [...prev, dayId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-mint-800">Create New Study Plan</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Plan Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mathematics Final Prep"
                  className="border-mint-200 focus:border-mint-400"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                <Select value={subject} onValueChange={setSubject}>
                  <SelectTrigger className="border-mint-200 focus:border-mint-400">
                    <SelectValue placeholder={subjectsLoading ? "Loading subjects..." : "Select a subject"} />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((subj) => (
                      <SelectItem key={subj.id} value={subj.name}>
                        {subj.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic" className="text-sm font-medium">Topic *</Label>
              <Input
                id="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Calculus Integration Techniques"
                className="border-mint-200 focus:border-mint-400"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your study goals and what you want to achieve..."
                rows={3}
                className="border-mint-200 focus:border-mint-400"
              />
            </div>
          </div>

          {/* Schedule Settings */}
          <div className="space-y-4 p-4 bg-mint-50 rounded-lg">
            <h3 className="text-lg font-medium text-mint-800">Schedule Settings</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-mint-200",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">End Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal border-mint-200",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Daily Study Duration *</Label>
              <div className="flex gap-2 items-center">
                <Select value={dailyDurationHours.toString()} onValueChange={(value) => setDailyDurationHours(parseInt(value))}>
                  <SelectTrigger className="w-24 border-mint-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 8 }, (_, i) => (
                      <SelectItem key={i} value={i.toString()}>
                        {i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">hours</span>
                
                <Select value={dailyDurationMinutes.toString()} onValueChange={(value) => setDailyDurationMinutes(parseInt(value))}>
                  <SelectTrigger className="w-24 border-mint-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[0, 15, 30, 45].map(minutes => (
                      <SelectItem key={minutes} value={minutes.toString()}>
                        {minutes}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <span className="text-sm text-gray-600">minutes</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Study Days *</Label>
              <div className="grid grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={day.id}
                      checked={studyDays.includes(day.id)}
                      onCheckedChange={() => handleDayToggle(day.id)}
                      className="border-mint-300 data-[state=checked]:bg-mint-600"
                    />
                    <Label 
                      htmlFor={day.id} 
                      className="text-sm font-normal cursor-pointer"
                    >
                      {day.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-mint-600 hover:bg-mint-700 text-white px-6"
            >
              Create Study Plan
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
