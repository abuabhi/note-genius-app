import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/ui/rich-text/RichTextEditor';
import { X, Plus } from 'lucide-react';
import { useUpdateHelpTopic, HelpTopic } from '@/hooks/help/useHelpTopics';
import { htmlToMarkdown, markdownToHtml } from '@/utils/markdownConverter';
import { toast } from 'sonner';

interface HelpTopicEditDialogProps {
  topic: HelpTopic;
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

export const HelpTopicEditDialog = ({ topic, open, onOpenChange }: HelpTopicEditDialogProps) => {
  const [formData, setFormData] = useState({
    title: topic.title,
    description: topic.description,
    content: topic.content,
    category: topic.category,
    priority: topic.priority,
    video_url: topic.video_url || '',
    video_title: topic.video_title || '',
    video_duration: topic.video_duration || '',
    image_url: topic.image_url || '',
    tags: topic.tags || [],
    quick_tips: topic.quick_tips || []
  });

  const [newTag, setNewTag] = useState('');
  const [newTip, setNewTip] = useState('');

  const updateTopic = useUpdateHelpTopic();

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
      // Wait for the mutation and cache refresh to complete
      await updateTopic.mutateAsync({
        id: topic.id,
        ...formData
      });
      
      toast.success('Help topic updated successfully!');
      
      // Only close dialog after cache has been refreshed
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating help topic:', error);
      toast.error('Failed to update help topic');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Help Topic</DialogTitle>
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

          <div>
            <Label>Content</Label>
            <RichTextEditor
              content={markdownToHtml(formData.content)}
              onChange={(html) => setFormData(prev => ({ 
                ...prev, 
                content: htmlToMarkdown(html) 
              }))}
              placeholder="Enter help topic content..."
            />
          </div>

          {/* Image Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Image & Video Settings</h3>
            <div>
              <Label htmlFor="image_url">Thumbnail Image URL</Label>
              <Input
                id="image_url"
                value={formData.image_url}
                onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                placeholder="https://example.com/image.jpg"
              />
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
            <Button type="submit" disabled={updateTopic.isPending}>
              {updateTopic.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};