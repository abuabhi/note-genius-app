import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { useCreateHelpTopic, HelpTopicSection } from '@/hooks/help/useHelpTopics';
import { MultiImageField } from '@/components/admin/help/MultiImageField';
import { toast } from 'sonner';

interface HelpTopicCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const categories = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'notes', label: 'Notes' },
  { value: 'flashcards', label: 'Flashcards' },
  { value: 'ai-features', label: 'AI Features' },
  { value: 'reminders', label: 'Reminders' },
  { value: 'import-export', label: 'Import & Export' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'study-sessions', label: 'Study Sessions' },
  { value: 'progress', label: 'Progress' },
  { value: 'settings', label: 'Settings' },
  { value: 'advanced', label: 'Advanced' }
];

export const HelpTopicCreateDialog = ({ open, onOpenChange }: HelpTopicCreateDialogProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'getting-started',
    priority: 1,
    video_url: '',
    video_title: '',
    video_duration: '',
    image_url: '',
    show_video: false,
    tags: [] as string[],
    quick_tips: [] as string[],
    sections: [] as Omit<HelpTopicSection, 'id'>[]
  });

  const [newTag, setNewTag] = useState('');
  const [newTip, setNewTip] = useState('');

  const createTopic = useCreateHelpTopic();

  const addSection = () => {
    setFormData(prev => ({
      ...prev,
      sections: [...prev.sections, {
        title: '',
        content: '',
        image_url: '',
        image_urls: [],
        sort_order: prev.sections.length
      }]
    }));
  };

  const removeSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
  };

  const updateSection = (index: number, field: keyof Omit<HelpTopicSection, 'id'>, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const addTip = () => {
    if (newTip.trim()) {
      setFormData(prev => ({
        ...prev,
        quick_tips: [...prev.quick_tips, newTip.trim()]
      }));
      setNewTip('');
    }
  };

  const removeTip = (index: number) => {
    setFormData(prev => ({
      ...prev,
      quick_tips: prev.quick_tips.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTopic.mutateAsync({
        ...formData,
        is_active: true
      });
      
      toast.success('Help topic created successfully!');
      onOpenChange(false);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        category: 'getting-started',
        priority: 1,
        video_url: '',
        video_title: '',
        video_duration: '',
        image_url: '',
        show_video: false,
        tags: [],
        quick_tips: [],
        sections: []
      });
    } catch (error) {
      console.error('Error creating help topic:', error);
      toast.error('Failed to create help topic');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Help Topic</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
              required
            />
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Content Sections</h3>
              <Button type="button" onClick={addSection} variant="outline" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Section
              </Button>
            </div>

            {formData.sections.map((section, index) => (
              <div key={`section-${index}`} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Section {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSection(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>

                <div>
                  <Label>Section Title</Label>
                  <Input
                    value={section.title}
                    onChange={(e) => updateSection(index, 'title', e.target.value)}
                    placeholder="e.g., Manual Creation Steps"
                    required
                  />
                </div>

                <div>
                  <Label>Section Content</Label>
                  <Textarea
                    value={section.content}
                    onChange={(e) => updateSection(index, 'content', e.target.value)}
                    rows={4}
                    required
                  />
               </div>

               <div>
                 <MultiImageField
                   label="Section Images"
                   images={section.image_urls || []}
                   onChange={(images) => updateSection(index, 'image_urls', images)}
                 />
               </div>
              </div>
            ))}
          </div>

          {/* Video Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Video Settings</h3>
            
            {/* Admin-only Show Video Toggle */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
              <div>
                <Label className="text-base font-medium">Show Video to Users</Label>
                <p className="text-sm text-gray-600">Control whether the video content is visible to users</p>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show_video"
                  checked={formData.show_video}
                  onChange={(e) => setFormData(prev => ({ ...prev, show_video: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <Label htmlFor="show_video" className="text-sm">
                  {formData.show_video ? 'Enabled' : 'Hidden'}
                </Label>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="video_url">YouTube URL</Label>
                <Input
                  id="video_url"
                  value={formData.video_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_url: e.target.value }))}
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>
              <div>
                <Label htmlFor="video_title">Video Title</Label>
                <Input
                  id="video_title"
                  value={formData.video_title}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_title: e.target.value }))}
                  placeholder="Video title"
                />
              </div>
              <div>
                <Label htmlFor="video_duration">Duration</Label>
                <Input
                  id="video_duration"
                  value={formData.video_duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, video_duration: e.target.value }))}
                  placeholder="5:30"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <Label>Tags</Label>
            <div className="flex gap-2 mb-2 flex-wrap">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <X
                    className="h-3 w-3 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Tips */}
          <div>
            <Label>Quick Tips</Label>
            <div className="space-y-2 mb-2">
              {formData.quick_tips.map((tip, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1 p-2 bg-gray-50 rounded text-sm">
                    {tip}
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTip(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                placeholder="Add quick tip"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTip())}
              />
              <Button type="button" onClick={addTip} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Priority */}
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
              min="1"
              max="100"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createTopic.isPending}>
              {createTopic.isPending ? 'Creating...' : 'Create Topic'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};