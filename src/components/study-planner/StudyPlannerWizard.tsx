
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Calendar, Clock, BookOpen, Target } from 'lucide-react';
import { StudyPlanFormData, StudyTopic } from '@/types/studyPlanner';

interface StudyPlannerWizardProps {
  onSubmit: (data: StudyPlanFormData) => Promise<void>;
  isLoading?: boolean;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

export const StudyPlannerWizard = ({ onSubmit, isLoading }: StudyPlannerWizardProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StudyPlanFormData>({
    title: '',
    description: '',
    subject: '',
    start_date: '',
    end_date: '',
    total_hours_per_week: 5,
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

  const handleInputChange = (field: keyof StudyPlanFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTimeChange = (day: string, timeType: 'start' | 'end', value: string) => {
    setFormData(prev => ({
      ...prev,
      available_times: {
        ...prev.available_times,
        [day]: {
          ...prev.available_times[day],
          [timeType]: value,
        },
      },
    }));
  };

  const addTopic = () => {
    if (newTopic.name.trim()) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, { ...newTopic }],
      }));
      setNewTopic({ name: '', priority: 'medium', estimated_hours: 1 });
    }
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index),
    }));
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        available_days: [...prev.available_days, day],
        available_times: {
          ...prev.available_times,
          [day]: prev.available_times[day] || { start: '09:00', end: '17:00' },
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        available_days: prev.available_days.filter(d => d !== day),
        available_times: Object.fromEntries(
          Object.entries(prev.available_times).filter(([key]) => key !== day)
        ),
      }));
    }
  };

  const nextStep = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Failed to create study plan:', error);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <BookOpen className="h-12 w-12 text-mint-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
              <p className="text-gray-600">Let's start with the basics of your study plan</p>
            </div>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Plan Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Physics Final Exam Preparation"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="subject">Subject *</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  placeholder="e.g., Physics, Mathematics, Biology"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your study goals and what you want to achieve"
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_date">Start Date *</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => handleInputChange('start_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">End Date *</Label>
                  <Input
                    id="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => handleInputChange('end_date', e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Clock className="h-12 w-12 text-mint-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Study Schedule</h3>
              <p className="text-gray-600">Configure your weekly study schedule and preferences</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Total Hours Per Week: {formData.total_hours_per_week} hours</Label>
                <Slider
                  value={[formData.total_hours_per_week]}
                  onValueChange={(value) => handleInputChange('total_hours_per_week', value[0])}
                  max={40}
                  min={1}
                  step={1}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>1 hour</span>
                  <span>40 hours</span>
                </div>
              </div>

              <div>
                <Label>Preferred Session Duration: {formData.preferred_session_duration} minutes</Label>
                <Slider
                  value={[formData.preferred_session_duration]}
                  onValueChange={(value) => handleInputChange('preferred_session_duration', value[0])}
                  max={180}
                  min={15}
                  step={15}
                  className="mt-2"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>15 min</span>
                  <span>3 hours</span>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Available Study Days</Label>
                <div className="grid grid-cols-2 gap-3">
                  {DAYS_OF_WEEK.map((day) => (
                    <div key={day.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={day.value}
                        checked={formData.available_days.includes(day.value)}
                        onCheckedChange={(checked) => handleDayToggle(day.value, checked as boolean)}
                      />
                      <Label htmlFor={day.value}>{day.label}</Label>
                    </div>
                  ))}
                </div>
              </div>

              {formData.available_days.length > 0 && (
                <div>
                  <Label className="mb-3 block">Study Time Slots</Label>
                  <div className="space-y-3">
                    {formData.available_days.map((day) => (
                      <div key={day} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <span className="w-20 text-sm font-medium capitalize">{day}</span>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="time"
                            value={formData.available_times[day]?.start || '09:00'}
                            onChange={(e) => handleTimeChange(day, 'start', e.target.value)}
                            className="w-24"
                          />
                          <span className="text-gray-500">to</span>
                          <Input
                            type="time"
                            value={formData.available_times[day]?.end || '17:00'}
                            onChange={(e) => handleTimeChange(day, 'end', e.target.value)}
                            className="w-24"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Target className="h-12 w-12 text-mint-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Study Topics</h3>
              <p className="text-gray-600">Add the topics you want to study and their priorities</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add New Topic</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="topic_name">Topic Name</Label>
                  <Input
                    id="topic_name"
                    value={newTopic.name}
                    onChange={(e) => setNewTopic(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Thermodynamics, Calculus, Cell Biology"
                    className="mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newTopic.priority}
                      onValueChange={(value: 'low' | 'medium' | 'high') => 
                        setNewTopic(prev => ({ ...prev, priority: value }))
                      }
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="high">High Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Estimated Hours</Label>
                    <Input
                      type="number"
                      min="1"
                      max="100"
                      value={newTopic.estimated_hours}
                      onChange={(e) => setNewTopic(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 1 }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <Button onClick={addTopic} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Topic
                </Button>
              </CardContent>
            </Card>

            {formData.topics.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Your Study Topics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {formData.topics.map((topic, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{topic.name}</span>
                            <Badge 
                              variant={topic.priority === 'high' ? 'destructive' : topic.priority === 'medium' ? 'default' : 'secondary'}
                            >
                              {topic.priority}
                            </Badge>
                          </div>
                          <span className="text-sm text-gray-600">{topic.estimated_hours} hours</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTopic(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <Calendar className="h-12 w-12 text-mint-500 mx-auto mb-3" />
              <h3 className="text-xl font-semibold text-gray-900">Learning Preferences</h3>
              <p className="text-gray-600">Customize your learning style and difficulty preferences</p>
            </div>

            <div className="space-y-6">
              <div>
                <Label>Difficulty Level</Label>
                <Select
                  value={formData.difficulty_level}
                  onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                    handleInputChange('difficulty_level', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner - Start with basics</SelectItem>
                    <SelectItem value="intermediate">Intermediate - Balanced approach</SelectItem>
                    <SelectItem value="advanced">Advanced - Challenging content</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Study Style</Label>
                <Select
                  value={formData.study_style}
                  onValueChange={(value: 'focused' | 'mixed' | 'review-heavy') => 
                    handleInputChange('study_style', value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="focused">Focused - Deep dive into topics</SelectItem>
                    <SelectItem value="mixed">Mixed - Variety of activities</SelectItem>
                    <SelectItem value="review-heavy">Review Heavy - Lots of repetition</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Card className="p-4 bg-mint-50 border-mint-200">
                <h4 className="font-semibold text-mint-800 mb-2">Plan Summary</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Subject:</strong> {formData.subject}</p>
                  <p><strong>Duration:</strong> {formData.start_date} to {formData.end_date}</p>
                  <p><strong>Weekly Hours:</strong> {formData.total_hours_per_week} hours</p>
                  <p><strong>Topics:</strong> {formData.topics.length} topics</p>
                  <p><strong>Study Days:</strong> {formData.available_days.length} days per week</p>
                </div>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium ${
                step <= currentStep
                  ? 'bg-mint-500 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {step}
            </div>
          ))}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-mint-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(currentStep / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {renderStep()}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={prevStep}
          disabled={currentStep === 1}
        >
          Previous
        </Button>

        <div className="flex space-x-2">
          {currentStep < 4 ? (
            <Button
              onClick={nextStep}
              disabled={
                (currentStep === 1 && (!formData.title || !formData.subject || !formData.start_date || !formData.end_date)) ||
                (currentStep === 2 && formData.available_days.length === 0) ||
                (currentStep === 3 && formData.topics.length === 0)
              }
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isLoading}
              className="bg-mint-500 hover:bg-mint-600"
            >
              {isLoading ? 'Creating...' : 'Create Study Plan'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
