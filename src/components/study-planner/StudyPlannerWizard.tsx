
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Minus, Calendar, Clock, Target } from 'lucide-react';
import { StudyPlanFormData, StudyTopic } from '@/types/studyPlanner';

interface StudyPlannerWizardProps {
  onSubmit: (data: StudyPlanFormData) => void;
  isLoading?: boolean;
}

const WEEKDAYS = [
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
];

export const StudyPlannerWizard = ({ onSubmit, isLoading }: StudyPlannerWizardProps) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<StudyPlanFormData>({
    title: '',
    description: '',
    subject: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    total_hours_per_week: 10,
    preferred_session_duration: 60,
    available_days: ['monday', 'wednesday', 'friday'],
    available_times: {
      monday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
    },
    topics: [{ name: '', priority: 'medium', estimated_hours: 5 }],
    difficulty_level: 'intermediate',
    study_style: 'mixed',
  });

  const updateFormData = (updates: Partial<StudyPlanFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const addTopic = () => {
    setFormData(prev => ({
      ...prev,
      topics: [...prev.topics, { name: '', priority: 'medium', estimated_hours: 5 }]
    }));
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const updateTopic = (index: number, updates: Partial<StudyTopic>) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.map((topic, i) => 
        i === index ? { ...topic, ...updates } : topic
      )
    }));
  };

  const handleDayToggle = (day: string, checked: boolean) => {
    const newAvailableDays = checked 
      ? [...formData.available_days, day]
      : formData.available_days.filter(d => d !== day);
    
    const newAvailableTimes = { ...formData.available_times };
    if (checked && !newAvailableTimes[day]) {
      newAvailableTimes[day] = { start: '09:00', end: '17:00' };
    } else if (!checked) {
      delete newAvailableTimes[day];
    }
    
    updateFormData({
      available_days: newAvailableDays,
      available_times: newAvailableTimes,
    });
  };

  const updateTimeSlot = (day: string, field: 'start' | 'end', value: string) => {
    updateFormData({
      available_times: {
        ...formData.available_times,
        [day]: {
          ...formData.available_times[day],
          [field]: value,
        },
      },
    });
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Calendar className="h-12 w-12 text-mint-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold">Basic Information</h2>
        <p className="text-gray-600">Let's start with the basics of your study plan</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Plan Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => updateFormData({ title: e.target.value })}
            placeholder="e.g., Math Final Exam Preparation"
          />
        </div>
        
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input
            id="subject"
            value={formData.subject}
            onChange={(e) => updateFormData({ subject: e.target.value })}
            placeholder="e.g., Mathematics, History, Physics"
          />
        </div>
        
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => updateFormData({ description: e.target.value })}
            placeholder="Brief description of your study goals"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => updateFormData({ start_date: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="end_date">End Date</Label>
            <Input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => updateFormData({ end_date: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Clock className="h-12 w-12 text-mint-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold">Study Schedule</h2>
        <p className="text-gray-600">When are you available to study?</p>
      </div>
      
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="hours_per_week">Hours per Week</Label>
            <Input
              id="hours_per_week"
              type="number"
              min="1"
              max="40"
              value={formData.total_hours_per_week}
              onChange={(e) => updateFormData({ total_hours_per_week: parseInt(e.target.value) })}
            />
          </div>
          <div>
            <Label htmlFor="session_duration">Session Duration (minutes)</Label>
            <Select 
              value={formData.preferred_session_duration.toString()}
              onValueChange={(value) => updateFormData({ preferred_session_duration: parseInt(value) })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="45">45 minutes</SelectItem>
                <SelectItem value="60">1 hour</SelectItem>
                <SelectItem value="90">1.5 hours</SelectItem>
                <SelectItem value="120">2 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <Label>Available Days</Label>
          <div className="space-y-3 mt-2">
            {WEEKDAYS.map(day => (
              <div key={day} className="flex items-center space-x-4">
                <Checkbox
                  id={day}
                  checked={formData.available_days.includes(day)}
                  onCheckedChange={(checked) => handleDayToggle(day, checked as boolean)}
                />
                <Label htmlFor={day} className="capitalize w-20">
                  {day}
                </Label>
                {formData.available_days.includes(day) && (
                  <div className="flex space-x-2">
                    <Input
                      type="time"
                      value={formData.available_times[day]?.start || '09:00'}
                      onChange={(e) => updateTimeSlot(day, 'start', e.target.value)}
                      className="w-24"
                    />
                    <span>to</span>
                    <Input
                      type="time"
                      value={formData.available_times[day]?.end || '17:00'}
                      onChange={(e) => updateTimeSlot(day, 'end', e.target.value)}
                      className="w-24"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <Target className="h-12 w-12 text-mint-500 mx-auto mb-2" />
        <h2 className="text-2xl font-bold">Topics & Preferences</h2>
        <p className="text-gray-600">What topics will you study and how?</p>
      </div>
      
      <div className="space-y-4">
        <div>
          <Label>Study Topics</Label>
          <div className="space-y-3 mt-2">
            {formData.topics.map((topic, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 border rounded-lg">
                <Input
                  placeholder="Topic name"
                  value={topic.name}
                  onChange={(e) => updateTopic(index, { name: e.target.value })}
                  className="flex-1"
                />
                <Select
                  value={topic.priority}
                  onValueChange={(value) => updateTopic(index, { priority: value as any })}
                >
                  <SelectTrigger className="w-24">
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
                  min="1"
                  value={topic.estimated_hours}
                  onChange={(e) => updateTopic(index, { estimated_hours: parseInt(e.target.value) })}
                  className="w-20"
                  placeholder="Hrs"
                />
                {formData.topics.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeTopic(index)}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              variant="outline"
              onClick={addTopic}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Topic
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Difficulty Level</Label>
            <Select
              value={formData.difficulty_level}
              onValueChange={(value) => updateFormData({ difficulty_level: value as any })}
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
              value={formData.study_style}
              onValueChange={(value) => updateFormData({ study_style: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="focused">Focused</SelectItem>
                <SelectItem value="mixed">Mixed</SelectItem>
                <SelectItem value="review-heavy">Review Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.title && formData.subject && formData.start_date && formData.end_date;
      case 2:
        return formData.available_days.length > 0 && formData.total_hours_per_week > 0;
      case 3:
        return formData.topics.length > 0 && formData.topics.every(t => t.name && t.estimated_hours > 0);
      default:
        return false;
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Create Study Plan</CardTitle>
          <div className="text-sm text-gray-500">Step {step} of 3</div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-mint-500 h-2 rounded-full transition-all"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
          >
            Previous
          </Button>
          
          {step < 3 ? (
            <Button
              onClick={() => setStep(step + 1)}
              disabled={!isStepValid()}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={() => onSubmit(formData)}
              disabled={!isStepValid() || isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Plan'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
