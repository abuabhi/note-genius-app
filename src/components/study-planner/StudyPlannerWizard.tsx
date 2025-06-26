
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, X, Clock, Calendar, Target, BookOpen, Zap } from 'lucide-react';
import { StudyPlanFormData, StudyTopic } from '@/types/studyPlanner';
import { useSettings } from '@/hooks/useSettings';

interface StudyPlannerWizardProps {
  onSubmit: (data: StudyPlanFormData) => void;
  isLoading: boolean;
}

export const StudyPlannerWizard = ({ onSubmit, isLoading }: StudyPlannerWizardProps) => {
  const { settings } = useSettings();
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form state with proper typing
  const [formData, setFormData] = useState<StudyPlanFormData>({
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
    study_style: 'mixed',
  });

  const [newTopic, setNewTopic] = useState<StudyTopic>({
    name: '',
    priority: 'medium',
    estimated_hours: 1,
  });

  const days = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  const handleDayToggle = (day: string) => {
    const newDays = formData.available_days.includes(day)
      ? formData.available_days.filter(d => d !== day)
      : [...formData.available_days, day];
    
    const newTimes = { ...formData.available_times };
    if (newDays.includes(day) && !newTimes[day]) {
      newTimes[day] = { start: '09:00', end: '17:00' };
    } else if (!newDays.includes(day)) {
      delete newTimes[day];
    }

    setFormData({
      ...formData,
      available_days: newDays,
      available_times: newTimes,
    });
  };

  const handleTimeSlotChange = (day: string, field: 'start' | 'end', value: string) => {
    setFormData({
      ...formData,
      available_times: {
        ...formData.available_times,
        [day]: {
          ...formData.available_times[day],
          [field]: value,
        },
      },
    });
  };

  const addTopic = () => {
    if (newTopic.name.trim()) {
      setFormData({
        ...formData,
        topics: [...formData.topics, newTopic],
      });
      setNewTopic({
        name: '',
        priority: 'medium',
        estimated_hours: 1,
      });
    }
  };

  const removeTopic = (index: number) => {
    setFormData({
      ...formData,
      topics: formData.topics.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const validateForm = () => {
    return (
      formData.title.trim() &&
      formData.subject.trim() &&
      formData.start_date &&
      formData.end_date &&
      formData.available_days.length > 0 &&
      formData.topics.length > 0
    );
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
              step <= currentStep 
                ? 'bg-mint-500 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 4 && (
              <div className={`h-1 w-16 mx-2 ${
                step < currentStep ? 'bg-mint-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="min-h-[500px]">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-mint-50/30">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-mint-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="h-8 w-8 text-mint-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Plan Details</CardTitle>
              <CardDescription className="text-lg">Let's start with the basics of your study plan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium text-gray-700">
                    Plan Title *
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g., Mathematics Final Exam Prep"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="h-12 border-mint-200 focus:border-mint-500 focus:ring-mint-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject" className="text-sm font-medium text-gray-700">
                    Subject *
                  </Label>
                  <Select 
                    value={formData.subject} 
                    onValueChange={(value) => setFormData({ ...formData, subject: value })}
                  >
                    <SelectTrigger className="h-12 border-mint-200 focus:border-mint-500">
                      <SelectValue placeholder="Choose your subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {settings?.subjects?.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      )) || [
                        <SelectItem key="math" value="Mathematics">Mathematics</SelectItem>,
                        <SelectItem key="science" value="Science">Science</SelectItem>,
                        <SelectItem key="english" value="English">English</SelectItem>,
                        <SelectItem key="history" value="History">History</SelectItem>,
                      ]}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe your study goals and what you want to achieve..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="min-h-[100px] border-mint-200 focus:border-mint-500 focus:ring-mint-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="start_date" className="text-sm font-medium text-gray-700">
                    Start Date *
                  </Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="h-12 border-mint-200 focus:border-mint-500 focus:ring-mint-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="end_date" className="text-sm font-medium text-gray-700">
                    End Date *
                  </Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="h-12 border-mint-200 focus:border-mint-500 focus:ring-mint-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Schedule Preferences */}
        {currentStep === 2 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50/30">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Study Schedule</CardTitle>
              <CardDescription className="text-lg">Set your preferred study times and intensity</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Study Hours per Week: {formData.total_hours_per_week} hours
                  </Label>
                  <Slider
                    value={[formData.total_hours_per_week]}
                    onValueChange={(value) => setFormData({ ...formData, total_hours_per_week: value[0] })}
                    max={40}
                    min={5}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>5 hours</span>
                    <span>40 hours</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">
                    Session Duration: {formData.preferred_session_duration} minutes
                  </Label>
                  <Slider
                    value={[formData.preferred_session_duration]}
                    onValueChange={(value) => setFormData({ ...formData, preferred_session_duration: value[0] })}
                    max={180}
                    min={30}
                    step={15}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>30 min</span>
                    <span>3 hours</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium text-gray-700">Available Days *</Label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {days.map((day) => (
                    <Button
                      key={day.key}
                      type="button"
                      variant={formData.available_days.includes(day.key) ? "default" : "outline"}
                      onClick={() => handleDayToggle(day.key)}
                      className={`h-12 ${
                        formData.available_days.includes(day.key)
                          ? 'bg-mint-500 hover:bg-mint-600 text-white'
                          : 'hover:bg-mint-50 hover:border-mint-300'
                      }`}
                    >
                      {day.label.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              {formData.available_days.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Time Slots</Label>
                  <div className="grid gap-4">
                    {formData.available_days.map((day) => (
                      <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                        <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                          {day.slice(0, 3)}
                        </div>
                        <div className="flex items-center gap-2">
                          <Input
                            type="time"
                            value={formData.available_times[day]?.start || '09:00'}
                            onChange={(e) => handleTimeSlotChange(day, 'start', e.target.value)}
                            className="w-32"
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={formData.available_times[day]?.end || '17:00'}
                            onChange={(e) => handleTimeSlotChange(day, 'end', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 3: Topics */}
        {currentStep === 3 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-purple-50/30">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-purple-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Study Topics</CardTitle>
              <CardDescription className="text-lg">Add the topics you want to focus on</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-lg">
                <Label className="text-sm font-medium text-gray-700 mb-4 block">Add New Topic</Label>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="md:col-span-2">
                    <Input
                      placeholder="Topic name (e.g., Algebra, Calculus)"
                      value={newTopic.name}
                      onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
                      className="h-10"
                    />
                  </div>
                  <Select 
                    value={newTopic.priority} 
                    onValueChange={(value: 'high' | 'medium' | 'low') => 
                      setNewTopic({ ...newTopic, priority: value })
                    }
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0.5"
                      max="20"
                      step="0.5"
                      value={newTopic.estimated_hours}
                      onChange={(e) => setNewTopic({ ...newTopic, estimated_hours: parseFloat(e.target.value) || 1 })}
                      className="h-10 w-20"
                    />
                    <Button onClick={addTopic} size="sm" className="h-10 px-3">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {formData.topics.length > 0 && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">Your Topics ({formData.topics.length})</Label>
                  <div className="grid gap-3">
                    {formData.topics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-center gap-3">
                          <div className="font-medium text-gray-900">{topic.name}</div>
                          <Badge className={getPriorityColor(topic.priority)}>
                            {topic.priority}
                          </Badge>
                          <div className="text-sm text-gray-500">
                            {topic.estimated_hours}h
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTopic(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Step 4: Preferences */}
        {currentStep === 4 && (
          <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-green-50/30">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-gray-900">Study Preferences</CardTitle>
              <CardDescription className="text-lg">Customize your learning approach</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Difficulty Level</Label>
                  <Select 
                    value={formData.difficulty_level} 
                    onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                      setFormData({ ...formData, difficulty_level: value })
                    }
                  >
                    <SelectTrigger className="h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-sm font-medium text-gray-700">Study Style</Label>
                  <Select 
                    value={formData.study_style} 
                    onValueChange={(value: 'focused' | 'mixed' | 'review-heavy') => 
                      setFormData({ ...formData, study_style: value })
                    }
                  >
                    <SelectTrigger className="h-12">
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

              <div className="bg-mint-50 border border-mint-200 rounded-lg p-6">
                <h3 className="font-medium text-mint-800 mb-2">Plan Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Title:</span>
                    <span className="ml-2 font-medium">{formData.title || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Subject:</span>
                    <span className="ml-2 font-medium">{formData.subject || 'Not set'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Duration:</span>
                    <span className="ml-2 font-medium">
                      {formData.start_date && formData.end_date
                        ? `${formData.start_date} to ${formData.end_date}`
                        : 'Not set'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Weekly Hours:</span>
                    <span className="ml-2 font-medium">{formData.total_hours_per_week}h</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Topics:</span>
                    <span className="ml-2 font-medium">{formData.topics.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Study Days:</span>
                    <span className="ml-2 font-medium">{formData.available_days.length}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
          className="min-w-[100px]"
        >
          Previous
        </Button>
        
        <div className="text-sm text-gray-500">
          Step {currentStep} of 4
        </div>
        
        {currentStep < 4 ? (
          <Button
            type="button"
            onClick={nextStep}
            className="min-w-[100px] bg-mint-500 hover:bg-mint-600"
          >
            Next
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!validateForm() || isLoading}
            className="min-w-[100px] bg-mint-500 hover:bg-mint-600"
          >
            {isLoading ? 'Creating...' : 'Create Plan'}
          </Button>
        )}
      </div>
    </div>
  );
};
