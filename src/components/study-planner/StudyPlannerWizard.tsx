
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StudyPlanFormData, StudyTopic } from '@/types/studyPlanner';
import { Calendar, Clock, BookOpen, Target, Plus, X, ArrowLeft, ArrowRight } from 'lucide-react';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  total_hours_per_week: z.number().min(1).max(40),
  preferred_session_duration: z.number().min(15).max(300),
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

export const StudyPlannerWizard = ({ onSubmit, isLoading = false }: StudyPlannerWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [topics, setTopics] = useState<StudyTopic[]>([]);
  const [newTopic, setNewTopic] = useState({ name: '', priority: 'medium' as const, estimated_hours: 1 });

  const form = useForm<StudyPlanFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      subject: '',
      start_date: '',
      end_date: '',
      total_hours_per_week: 10,
      preferred_session_duration: 60,
      available_days: [],
      available_times: {},
      topics: [],
      difficulty_level: 'intermediate',
      study_style: 'focused'
    }
  });

  const totalSteps = 4;
  const daysOfWeek = [
    { value: 'monday', label: 'Monday' },
    { value: 'tuesday', label: 'Tuesday' },
    { value: 'wednesday', label: 'Wednesday' },
    { value: 'thursday', label: 'Thursday' },
    { value: 'friday', label: 'Friday' },
    { value: 'saturday', label: 'Saturday' },
    { value: 'sunday', label: 'Sunday' }
  ];

  const addTopic = () => {
    if (newTopic.name.trim()) {
      const updatedTopics = [...topics, { ...newTopic, estimated_hours: Number(newTopic.estimated_hours) }];
      setTopics(updatedTopics);
      form.setValue('topics', updatedTopics);
      setNewTopic({ name: '', priority: 'medium', estimated_hours: 1 });
    }
  };

  const removeTopic = (index: number) => {
    const updatedTopics = topics.filter((_, i) => i !== index);
    setTopics(updatedTopics);
    form.setValue('topics', updatedTopics);
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (data: StudyPlanFormData) => {
    await onSubmit(data);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <BookOpen className="h-12 w-12 text-mint-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
              <p className="text-gray-600">Let's start with the fundamentals of your study plan</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Plan Title *</Label>
                <Input
                  id="title"
                  placeholder="e.g., Calculus Final Exam Prep"
                  {...form.register('title')}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  placeholder="e.g., Mathematics"
                  {...form.register('subject')}
                />
                {form.formState.errors.subject && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.subject.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Brief description of your study goals..."
                  rows={3}
                  {...form.register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    {...form.register('start_date')}
                  />
                  {form.formState.errors.start_date && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.start_date.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    {...form.register('end_date')}
                  />
                  {form.formState.errors.end_date && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.end_date.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Clock className="h-12 w-12 text-mint-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">Schedule & Time</h2>
              <p className="text-gray-600">Configure your study schedule and time preferences</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Hours per Week: {form.watch('total_hours_per_week')}</Label>
                <Slider
                  value={[form.watch('total_hours_per_week') || 10]}
                  onValueChange={(value) => form.setValue('total_hours_per_week', value[0])}
                  max={40}
                  min={1}
                  step={1}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Session Duration: {form.watch('preferred_session_duration')} minutes</Label>
                <Slider
                  value={[form.watch('preferred_session_duration') || 60]}
                  onValueChange={(value) => form.setValue('preferred_session_duration', value[0])}
                  max={300}
                  min={15}
                  step={15}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Available Days *</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {daysOfWeek.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.value}
                        checked={form.watch('available_days')?.includes(day.value)}
                        onCheckedChange={(checked) => {
                          const currentDays = form.watch('available_days') || [];
                          if (checked) {
                            form.setValue('available_days', [...currentDays, day.value]);
                          } else {
                            form.setValue('available_days', currentDays.filter(d => d !== day.value));
                          }
                        }}
                      />
                      <Label htmlFor={day.value}>{day.label}</Label>
                    </div>
                  ))}
                </div>
                {form.formState.errors.available_days && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.available_days.message}</p>
                )}
              </div>

              <div>
                <Label>Time Slots</Label>
                {form.watch('available_days')?.map((day) => (
                  <div key={day} className="flex items-center gap-2 mt-2">
                    <span className="text-sm font-medium w-20 capitalize">{day}:</span>
                    <Input
                      type="time"
                      placeholder="Start"
                      onChange={(e) => {
                        const times = form.watch('available_times') || {};
                        form.setValue('available_times', {
                          ...times,
                          [day]: { ...times[day], start: e.target.value }
                        });
                      }}
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      placeholder="End"
                      onChange={(e) => {
                        const times = form.watch('available_times') || {};
                        form.setValue('available_times', {
                          ...times,
                          [day]: { ...times[day], end: e.target.value }
                        });
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-mint-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">Topics & Content</h2>
              <p className="text-gray-600">Define what you want to study and focus areas</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Add Study Topics *</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    placeholder="Topic name"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                  />
                  <Select
                    value={newTopic.priority}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setNewTopic({ ...newTopic, priority: value })
                    }
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    type="number"
                    placeholder="Hours"
                    className="w-20"
                    min={1}
                    value={newTopic.estimated_hours}
                    onChange={(e) => setNewTopic({ ...newTopic, estimated_hours: parseInt(e.target.value) || 1 })}
                  />
                  <Button type="button" onClick={addTopic} size="sm">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {topics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2 p-3 bg-mint-50 rounded-lg">
                    <div className="flex-1">
                      <span className="font-medium">{topic.name}</span>
                      <div className="flex gap-2 mt-1">
                        <Badge variant={topic.priority === 'high' ? 'destructive' : topic.priority === 'medium' ? 'default' : 'secondary'}>
                          {topic.priority}
                        </Badge>
                        <Badge variant="outline">{topic.estimated_hours}h</Badge>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTopic(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              {form.formState.errors.topics && (
                <p className="text-sm text-red-600">{form.formState.errors.topics.message}</p>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-mint-600 mx-auto mb-3" />
              <h2 className="text-xl font-semibold text-gray-900">Study Preferences</h2>
              <p className="text-gray-600">Customize your learning approach and difficulty</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Difficulty Level</Label>
                <Select
                  value={form.watch('difficulty_level')}
                  onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') =>
                    form.setValue('difficulty_level', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Study Style</Label>
                <Select
                  value={form.watch('study_style')}
                  onValueChange={(value: 'focused' | 'mixed' | 'review-heavy') =>
                    form.setValue('study_style', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="focused">Focused Sessions</SelectItem>
                    <SelectItem value="mixed">Mixed Approach</SelectItem>
                    <SelectItem value="review-heavy">Review Heavy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                i + 1 <= currentStep
                  ? 'bg-mint-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {i + 1}
            </div>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          Step {currentStep} of {totalSteps}
        </span>
      </div>

      <Card>
        <CardContent className="p-6">
          {renderStepContent()}
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        {currentStep < totalSteps ? (
          <Button type="button" onClick={nextStep}>
            Next
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Study Plan'}
          </Button>
        )}
      </div>
    </form>
  );
};
