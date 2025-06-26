
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarIcon, Plus, X, Clock, Target, BookOpen, Zap } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { StudyPlanFormData, StudyTopic } from '@/types/studyPlanner';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  total_hours_per_week: z.number().min(1, 'Hours per week must be at least 1'),
  preferred_session_duration: z.number().min(15, 'Session duration must be at least 15 minutes'),
  available_days: z.array(z.string()).min(1, 'Select at least one day'),
  available_times: z.record(z.object({
    start: z.string(),
    end: z.string()
  })),
  topics: z.array(z.object({
    name: z.string(),
    priority: z.enum(['low', 'medium', 'high']),
    estimated_hours: z.number()
  })).min(1, 'Add at least one topic'),
  difficulty_level: z.enum(['beginner', 'intermediate', 'advanced']),
  study_style: z.enum(['focused', 'mixed', 'review-heavy'])
});

interface StudyPlannerWizardProps {
  onSubmit: (data: StudyPlanFormData) => Promise<void>;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' }
];

const PRIORITY_COLORS = {
  low: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  high: 'bg-red-100 text-red-800 border-red-200'
};

export const StudyPlannerWizard: React.FC<StudyPlannerWizardProps> = ({ onSubmit, isLoading }) => {
  const { subjects, isLoading: subjectsLoading } = useUserSubjects();
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [newTopic, setNewTopic] = useState({ name: '', priority: 'medium' as const, estimated_hours: 2 });
  const [availableTimes, setAvailableTimes] = useState<Record<string, { start: string; end: string }>>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      total_hours_per_week: 5,
      preferred_session_duration: 60,
      available_days: [],
      available_times: {},
      topics: [],
      difficulty_level: 'intermediate',
      study_style: 'mixed'
    }
  });

  const handleAddTopic = () => {
    if (newTopic.name.trim()) {
      const topic: StudyTopic = {
        name: newTopic.name.trim(),
        priority: newTopic.priority,
        estimated_hours: newTopic.estimated_hours
      };
      setTopics([...topics, topic]);
      setNewTopic({ name: '', priority: 'medium', estimated_hours: 2 });
    }
  };

  const handleRemoveTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const handleDayToggle = (day: string) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    setSelectedDays(newSelectedDays);
    
    // Update available times
    const newAvailableTimes = { ...availableTimes };
    if (newSelectedDays.includes(day) && !newAvailableTimes[day]) {
      newAvailableTimes[day] = { start: '09:00', end: '17:00' };
    } else if (!newSelectedDays.includes(day)) {
      delete newAvailableTimes[day];
    }
    setAvailableTimes(newAvailableTimes);
  };

  const handleTimeChange = (day: string, type: 'start' | 'end', value: string) => {
    setAvailableTimes(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [type]: value
      }
    }));
  };

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    const formData: StudyPlanFormData = {
      ...data,
      start_date: startDate ? format(startDate, 'yyyy-MM-dd') : '',
      end_date: endDate ? format(endDate, 'yyyy-MM-dd') : '',
      available_days: selectedDays,
      available_times: availableTimes,
      topics: topics
    };
    
    await onSubmit(formData);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-mint-500 to-blue-500 p-3 rounded-full">
            <Target className="h-8 w-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-mint-600 to-blue-600 bg-clip-text text-transparent">
          Create Your Study Plan
        </h2>
        <p className="text-gray-600 mt-2">
          Design a personalized study schedule that fits your goals and availability
        </p>
      </div>

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        {/* Basic Information */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-mint-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <BookOpen className="h-5 w-5 text-mint-600" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">Plan Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Mathematics Final Exam Prep"
                  className="border-mint-200 focus:border-mint-500"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                <Select onValueChange={(value) => form.setValue('subject', value)}>
                  <SelectTrigger className="border-mint-200 focus:border-mint-500">
                    <SelectValue placeholder="Choose a subject" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-mint-200">
                    {subjectsLoading ? (
                      <SelectItem value="loading" disabled>Loading subjects...</SelectItem>
                    ) : (
                      <>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.id} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">Other</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
                {form.formState.errors.subject && (
                  <p className="text-sm text-red-600">{form.formState.errors.subject.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of your study plan goals..."
                className="border-mint-200 focus:border-mint-500 min-h-[80px]"
                {...form.register('description')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      initialFocus
                      className="pointer-events-auto"
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
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Study Preferences */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Clock className="h-5 w-5 text-blue-600" />
              Study Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Hours per Week: {form.watch('total_hours_per_week')}h
                </Label>
                <Slider
                  value={[form.watch('total_hours_per_week')]}
                  onValueChange={(value) => form.setValue('total_hours_per_week', value[0])}
                  max={40}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">
                  Session Duration: {form.watch('preferred_session_duration')}min
                </Label>
                <Slider
                  value={[form.watch('preferred_session_duration')]}
                  onValueChange={(value) => form.setValue('preferred_session_duration', value[0])}
                  max={180}
                  min={15}
                  step={15}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Difficulty Level</Label>
                <Select onValueChange={(value) => form.setValue('difficulty_level', value as any)}>
                  <SelectTrigger className="border-mint-200">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Study Style</Label>
              <Select onValueChange={(value) => form.setValue('study_style', value as any)}>
                <SelectTrigger className="border-mint-200">
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="focused">Focused (Deep single-topic sessions)</SelectItem>
                  <SelectItem value="mixed">Mixed (Variety of topics per session)</SelectItem>
                  <SelectItem value="review-heavy">Review Heavy (Emphasis on revision)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Available Days & Times */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <CalendarIcon className="h-5 w-5 text-purple-600" />
              Availability
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label className="text-sm font-medium">Available Days *</Label>
              <div className="grid grid-cols-7 gap-2">
                {DAYS_OF_WEEK.map(({ value, label }) => (
                  <div key={value} className="flex flex-col items-center">
                    <Button
                      type="button"
                      variant={selectedDays.includes(value) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleDayToggle(value)}
                      className={cn(
                        "w-full h-12 text-xs",
                        selectedDays.includes(value) 
                          ? "bg-mint-500 hover:bg-mint-600 text-white" 
                          : "border-mint-200 hover:border-mint-400"
                      )}
                    >
                      {label}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {selectedDays.length > 0 && (
              <div className="space-y-4">
                <Label className="text-sm font-medium">Time Slots</Label>
                <div className="grid gap-4">
                  {selectedDays.map((day) => (
                    <div key={day} className="flex items-center gap-4 p-3 bg-white rounded-lg border border-mint-100">
                      <div className="w-20 text-sm font-medium capitalize">{day}</div>
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={availableTimes[day]?.start || '09:00'}
                          onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                          className="w-24 border-mint-200"
                        />
                        <span className="text-gray-400">to</span>
                        <Input
                          type="time"
                          value={availableTimes[day]?.end || '17:00'}
                          onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                          className="w-24 border-mint-200"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Topics */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-orange-50/30">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="h-5 w-5 text-orange-600" />
              Study Topics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg border border-orange-100">
                <Input
                  placeholder="Topic name"
                  value={newTopic.name}
                  onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                  className="border-orange-200"
                />
                <Select
                  value={newTopic.priority}
                  onValueChange={(value: 'low' | 'medium' | 'high') => 
                    setNewTopic(prev => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger className="border-orange-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="1"
                    max="100"
                    value={newTopic.estimated_hours}
                    onChange={(e) => setNewTopic(prev => ({ 
                      ...prev, 
                      estimated_hours: parseInt(e.target.value) || 1 
                    }))}
                    className="border-orange-200"
                  />
                  <span className="text-sm text-gray-500">hrs</span>
                </div>
                <Button
                  type="button"
                  onClick={handleAddTopic}
                  disabled={!newTopic.name.trim()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </div>

              {topics.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Topics ({topics.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {topics.map((topic, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className={cn(
                          "flex items-center gap-2 py-2 px-3 text-sm",
                          PRIORITY_COLORS[topic.priority]
                        )}
                      >
                        <span className="font-medium">{topic.name}</span>
                        <span className="text-xs opacity-75">
                          {topic.priority} • {topic.estimated_hours}h
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTopic(index)}
                          className="ml-1 hover:bg-black/10 rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end space-x-4 pt-6">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-mint-500 to-blue-500 hover:from-mint-600 hover:to-blue-600 text-white px-8 py-3 text-lg font-medium"
          >
            {isLoading ? 'Creating Plan...' : 'Create Study Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
};
