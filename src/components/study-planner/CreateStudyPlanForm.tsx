
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus, X } from 'lucide-react';
import { format } from 'date-fns';
import { useCreateStudyPlan } from '@/hooks/useCreateStudyPlan';
import { StudyPlanFormValues } from '@/types/studyPlanner';
import { toast } from 'sonner';

interface CreateStudyPlanFormProps {
  open: boolean;
  onClose: () => void;
}

export const CreateStudyPlanForm = ({ open, onClose }: CreateStudyPlanFormProps) => {
  const { createStudyPlan, isLoading } = useCreateStudyPlan();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StudyPlanFormValues>({
    title: '',
    description: '',
    subject: '',
    totalHours: 10,
    startDate: '',
    endDate: '',
    topics: [],
    difficultyLevel: 'intermediate',
    sessionDuration: 45,
    breakDuration: 10,
    maxSessionsPerDay: 3,
    learningStyle: 'mixed',
    studyDays: [],
    preferredTimes: []
  });

  const [newTopic, setNewTopic] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

  const addTopic = () => {
    if (newTopic.trim()) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (index: number) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async () => {
    try {
      const submitData = {
        ...formData,
        startDate: startDate ? format(startDate, 'yyyy-MM-dd') : '',
        endDate: endDate ? format(endDate, 'yyyy-MM-dd') : ''
      };

      await createStudyPlan(submitData);
      toast.success('Study plan created successfully!');
      onClose();
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        subject: '',
        totalHours: 10,
        startDate: '',
        endDate: '',
        topics: [],
        difficultyLevel: 'intermediate',
        sessionDuration: 45,
        breakDuration: 10,
        maxSessionsPerDay: 3,
        learningStyle: 'mixed',
        studyDays: [],
        preferredTimes: []
      });
      setCurrentStep(1);
      setStartDate(undefined);
      setEndDate(undefined);
    } catch (error) {
      toast.error('Failed to create study plan');
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Study Plan Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Mathematics Exam Preparation"
              />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of your study goals..."
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                placeholder="e.g., Mathematics, Physics, History"
              />
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label>Topics to Study</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                  placeholder="Add a topic"
                  onKeyPress={(e) => e.key === 'Enter' && addTopic()}
                />
                <Button type="button" onClick={addTopic}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-2 space-y-2">
                {formData.topics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span>{topic}</span>
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
            </div>
            
            <div>
              <Label>Difficulty Level</Label>
              <Select 
                value={formData.difficultyLevel} 
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                  setFormData(prev => ({ ...prev, difficultyLevel: value }))
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
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, 'PPP') : 'Pick a date'}
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
              
              <div>
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, 'PPP') : 'Pick a date'}
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
            
            <div>
              <Label>Total Hours to Study</Label>
              <Input
                type="number"
                value={formData.totalHours}
                onChange={(e) => setFormData(prev => ({ ...prev, totalHours: parseInt(e.target.value) || 0 }))}
                min="1"
                max="1000"
              />
            </div>
            
            <div>
              <Label>Study Days</Label>
              <div className="grid grid-cols-7 gap-2 mt-2">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                  <div key={day} className="flex items-center space-x-2">
                    <Checkbox
                      id={day}
                      checked={formData.studyDays.includes(day)}
                      onCheckedChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          studyDays: prev.studyDays.includes(day)
                            ? prev.studyDays.filter(d => d !== day)
                            : [...prev.studyDays, day]
                        }));
                      }}
                    />
                    <Label htmlFor={day} className="text-sm">{day.slice(0, 3)}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Session Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.sessionDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, sessionDuration: parseInt(e.target.value) || 45 }))}
                  min="15"
                  max="180"
                />
              </div>
              
              <div>
                <Label>Break Duration (minutes)</Label>
                <Input
                  type="number"
                  value={formData.breakDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) || 10 }))}
                  min="5"
                  max="60"
                />
              </div>
            </div>
            
            <div>
              <Label>Max Sessions Per Day</Label>
              <Input
                type="number"
                value={formData.maxSessionsPerDay}
                onChange={(e) => setFormData(prev => ({ ...prev, maxSessionsPerDay: parseInt(e.target.value) || 3 }))}
                min="1"
                max="10"
              />
            </div>
            
            <div>
              <Label>Learning Style</Label>
              <Select 
                value={formData.learningStyle} 
                onValueChange={(value: 'visual' | 'auditory' | 'kinesthetic' | 'mixed') => 
                  setFormData(prev => ({ ...prev, learningStyle: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="visual">Visual</SelectItem>
                  <SelectItem value="auditory">Auditory</SelectItem>
                  <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create Study Plan - Step {currentStep} of 4</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderStep()}
          
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            
            {currentStep < 4 ? (
              <Button
                onClick={() => setCurrentStep(prev => Math.min(4, prev + 1))}
                disabled={
                  (currentStep === 1 && (!formData.title || !formData.subject)) ||
                  (currentStep === 2 && formData.topics.length === 0) ||
                  (currentStep === 3 && (!startDate || !endDate))
                }
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Study Plan'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
