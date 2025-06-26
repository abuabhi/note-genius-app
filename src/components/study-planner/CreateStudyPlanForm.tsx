
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, BookOpen, Target, Plus, X, Loader2 } from 'lucide-react';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { useCreateStudyPlan } from '@/hooks/useCreateStudyPlan';
import { StudyPlanFormValues } from '@/types/studyPlanner';
import { toast } from 'sonner';

interface CreateStudyPlanFormProps {
  open: boolean;
  onClose: () => void;
}

export const CreateStudyPlanForm = ({ open, onClose }: CreateStudyPlanFormProps) => {
  const { subjects } = useUserSubjects();
  const { createStudyPlan, isLoading } = useCreateStudyPlan();
  
  const [formData, setFormData] = useState<StudyPlanFormValues>({
    title: '',
    description: '',
    subject: '',
    totalHours: 20,
    startDate: '',
    endDate: '',
    topics: [],
    difficultyLevel: 'intermediate',
    sessionDuration: 45,
    breakDuration: 10,
    maxSessionsPerDay: 2,
    learningStyle: 'mixed',
    studyDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
    preferredTimes: []
  });

  const [newTopic, setNewTopic] = useState('');
  const [activeTab, setActiveTab] = useState('basics');

  const handleInputChange = (field: keyof StudyPlanFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addTopic = () => {
    if (newTopic.trim() && !formData.topics.includes(newTopic.trim())) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, newTopic.trim()]
      }));
      setNewTopic('');
    }
  };

  const removeTopic = (topic: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(t => t !== topic)
    }));
  };

  const toggleStudyDay = (day: string) => {
    setFormData(prev => ({
      ...prev,
      studyDays: prev.studyDays.includes(day)
        ? prev.studyDays.filter(d => d !== day)
        : [...prev.studyDays, day]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.subject || formData.topics.length === 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await createStudyPlan(formData);
      toast.success('Study plan created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create study plan');
    }
  };

  const daysOfWeek = [
    { key: 'monday', label: 'Mon' },
    { key: 'tuesday', label: 'Tue' },
    { key: 'wednesday', label: 'Wed' },
    { key: 'thursday', label: 'Thu' },
    { key: 'friday', label: 'Fri' },
    { key: 'saturday', label: 'Sat' },
    { key: 'sunday', label: 'Sun' }
  ];

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl">
            <BookOpen className="h-5 w-5 mr-2 text-mint-600" />
            Create Study Plan
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basics">Basics</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="preferences">Preferences</TabsTrigger>
            </TabsList>

            <TabsContent value="basics" className="space-y-4 mt-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Plan Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="e.g., Math Final Exam Preparation"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Select value={formData.subject} onValueChange={(value) => handleInputChange('subject', value)}>
                    <SelectTrigger>
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your study plan goals and objectives"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalHours">Total Hours</Label>
                  <Input
                    id="totalHours"
                    type="number"
                    min="1"
                    max="200"
                    value={formData.totalHours}
                    onChange={(e) => handleInputChange('totalHours', parseInt(e.target.value))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="topics" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div>
                  <Label>Study Topics *</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      value={newTopic}
                      onChange={(e) => setNewTopic(e.target.value)}
                      placeholder="Enter a topic to study"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTopic())}
                    />
                    <Button type="button" onClick={addTopic} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Added Topics ({formData.topics.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {formData.topics.map((topic, index) => (
                      <Badge key={index} variant="secondary" className="pr-1">
                        {topic}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 ml-1"
                          onClick={() => removeTopic(topic)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                  {formData.topics.length === 0 && (
                    <p className="text-sm text-gray-500">No topics added yet</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select value={formData.difficultyLevel} onValueChange={(value: any) => handleInputChange('difficultyLevel', value)}>
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
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 mt-6">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Session Duration (minutes)</Label>
                  <Select value={formData.sessionDuration.toString()} onValueChange={(value) => handleInputChange('sessionDuration', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="90">1.5 hours</SelectItem>
                      <SelectItem value="120">2 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Break Duration (minutes)</Label>
                  <Select value={formData.breakDuration.toString()} onValueChange={(value) => handleInputChange('breakDuration', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="20">20 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Max Sessions/Day</Label>
                  <Select value={formData.maxSessionsPerDay.toString()} onValueChange={(value) => handleInputChange('maxSessionsPerDay', parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 session</SelectItem>
                      <SelectItem value="2">2 sessions</SelectItem>
                      <SelectItem value="3">3 sessions</SelectItem>
                      <SelectItem value="4">4 sessions</SelectItem>
                      <SelectItem value="5">5 sessions</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Study Days</Label>
                <div className="flex gap-2">
                  {daysOfWeek.map((day) => (
                    <Button
                      key={day.key}
                      type="button"
                      variant={formData.studyDays.includes(day.key) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleStudyDay(day.key)}
                      className={formData.studyDays.includes(day.key) ? "bg-mint-600 hover:bg-mint-700" : ""}
                    >
                      {day.label}
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences" className="space-y-4 mt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Learning Style</Label>
                  <Select value={formData.learningStyle} onValueChange={(value: any) => handleInputChange('learningStyle', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual Learner</SelectItem>
                      <SelectItem value="auditory">Auditory Learner</SelectItem>
                      <SelectItem value="kinesthetic">Kinesthetic Learner</SelectItem>
                      <SelectItem value="mixed">Mixed Approach</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Study Plan Summary</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm space-y-2">
                    <p><strong>Duration:</strong> {formData.totalHours} hours over {formData.studyDays.length} days/week</p>
                    <p><strong>Topics:</strong> {formData.topics.length} topics to cover</p>
                    <p><strong>Sessions:</strong> {formData.sessionDuration} min sessions with {formData.breakDuration} min breaks</p>
                    <p><strong>Difficulty:</strong> {formData.difficultyLevel}</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between mt-6 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <div className="flex gap-2">
              {activeTab !== 'basics' && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    const tabs = ['basics', 'topics', 'schedule', 'preferences'];
                    const currentIndex = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIndex - 1]);
                  }}
                >
                  Previous
                </Button>
              )}
              {activeTab !== 'preferences' ? (
                <Button
                  type="button"
                  onClick={() => {
                    const tabs = ['basics', 'topics', 'schedule', 'preferences'];
                    const currentIndex = tabs.indexOf(activeTab);
                    setActiveTab(tabs[currentIndex + 1]);
                  }}
                  className="bg-mint-600 hover:bg-mint-700"
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-mint-600 hover:bg-mint-700"
                >
                  {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Study Plan
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
