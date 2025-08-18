import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X, Plus, GripVertical, Trash2 } from 'lucide-react';
import { useCreateHelpTopic, useUpdateHelpTopic, HelpTopic, HelpTopicSection } from '@/hooks/help/useHelpTopics';
import { toast } from 'sonner';
import { RichTextEditor } from '@/components/ui/rich-text/RichTextEditor';
import { htmlToMarkdown, markdownToHtml } from '@/utils/markdownConverter';

const categories = [
  { value: 'getting-started', label: 'Getting Started' },
  { value: 'notes', label: 'Notes' },
  { value: 'flashcards', label: 'Flashcards' },
  { value: 'study-sessions', label: 'Study Sessions' },
  { value: 'progress', label: 'Progress' },
  { value: 'settings', label: 'Settings' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'ai-features', label: 'AI Features' },
  { value: 'reminders', label: 'Reminders' },
  { value: 'import-export', label: 'Import/Export' },
  { value: 'analytics', label: 'Analytics' },
  { value: 'goals-todos', label: 'Goals & Todos' },
  { value: 'upgrade', label: 'Upgrade' },
];

interface HelpTopicEditDialogProps {
  topic: HelpTopic | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function HelpTopicEditDialog({ topic, open, onOpenChange }: HelpTopicEditDialogProps) {
  const createHelpTopic = useCreateHelpTopic();
  const updateHelpTopic = useUpdateHelpTopic();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 1,
    video_url: '',
    video_title: '',
    video_duration: '',
    image_url: '',
    tags: [] as string[],
    quick_tips: [] as string[]
  });

  const [sections, setSections] = useState<Omit<HelpTopicSection, 'id'>[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newTip, setNewTip] = useState('');

  useEffect(() => {
    if (topic) {
      setFormData({
        title: topic.title || '',
        description: topic.description || '',
        category: topic.category || '',
        priority: topic.priority || 1,
        video_url: topic.video_url || '',
        video_title: topic.video_title || '',
        video_duration: topic.video_duration || '',
        image_url: topic.image_url || '',
        tags: topic.tags || [],
        quick_tips: topic.quick_tips || []
      });
      setSections(topic.sections?.map(s => ({
        title: s.title,
        content: s.content,
        image_url: s.image_url,
        sort_order: s.sort_order
      })) || []);
    } else {
      setFormData({
        title: '',
        description: '',
        category: '',
        priority: 1,
        video_url: '',
        video_title: '',
        video_duration: '',
        image_url: '',
        tags: [],
        quick_tips: []
      });
      setSections([]);
    }
  }, [topic]);

  const addSection = () => {
    setSections([...sections, {
      title: 'New Section',
      content: '',
      image_url: '',
      sort_order: sections.length
    }]);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const updateSection = (index: number, field: keyof Omit<HelpTopicSection, 'id'>, value: string) => {
    const updated = [...sections];
    updated[index] = { ...updated[index], [field]: value };
    setSections(updated);
  };

  const moveSection = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;

    const updated = [...sections];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    updated[index].sort_order = index;
    updated[newIndex].sort_order = newIndex;
    setSections(updated);
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const addTip = () => {
    if (newTip.trim()) {
      setFormData(prev => ({ ...prev, quick_tips: [...prev.quick_tips, newTip.trim()] }));
      setNewTip('');
    }
  };

  const removeTip = (tipToRemove: string) => {
    setFormData(prev => ({ ...prev, quick_tips: prev.quick_tips.filter(tip => tip !== tipToRemove) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (topic) {
        await updateHelpTopic.mutateAsync({
          id: topic.id,
          ...formData,
          is_active: true,
          sections
        });
        toast.success('Help topic updated successfully');
      } else {
        await createHelpTopic.mutateAsync({
          ...formData,
          is_active: true,
          sections
        });
        toast.success('Help topic created successfully');
      }
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save help topic');
    }
  };

  const isSubmitting = createHelpTopic.isPending || updateHelpTopic.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{topic ? 'Edit Help Topic' : 'Create Help Topic'}</DialogTitle>
          <DialogDescription>
            {topic ? 'Update the help topic details and sections.' : 'Create a new help topic with multiple sections.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Help topic title"
                required
              />
            </div>
            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the help topic"
              required
            />
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Input
              id="priority"
              type="number"
              min="1"
              max="10"
              value={formData.priority}
              onChange={(e) => setFormData(prev => ({ ...prev, priority: parseInt(e.target.value) || 1 }))}
            />
          </div>

          {/* Sections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">Sections</h3>
              <Button type="button" onClick={addSection} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Section
              </Button>
            </div>

            {sections.map((section, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">Section {index + 1}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(index, 'up')}
                      disabled={index === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => moveSection(index, 'down')}
                      disabled={index === sections.length - 1}
                    >
                      ↓
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSection(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Section Title</Label>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(index, 'title', e.target.value)}
                      placeholder="Section title"
                    />
                  </div>
                  <div>
                    <Label>Image URL</Label>
                    <Input
                      value={section.image_url || ''}
                      onChange={(e) => updateSection(index, 'image_url', e.target.value)}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                </div>

                <div>
                  <Label>Content</Label>
                  <RichTextEditor
                    content={markdownToHtml(section.content)}
                    onChange={(html) => updateSection(index, 'content', htmlToMarkdown(html))}
                    placeholder="Section content..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Image & Video Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Additional Settings</h3>
            <div>
              <Label htmlFor="image_url">Topic Thumbnail URL</Label>
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
            <div className="flex gap-2 mb-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} size="sm">Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="cursor-pointer" onClick={() => removeTag(tag)}>
                  {tag}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div>
            <Label>Quick Tips</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={newTip}
                onChange={(e) => setNewTip(e.target.value)}
                placeholder="Add quick tip..."
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTip())}
              />
              <Button type="button" onClick={addTip} size="sm">Add</Button>
            </div>
            <div className="space-y-1">
              {formData.quick_tips.map((tip, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                  <span className="flex-1">{tip}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeTip(tip)}>
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (topic ? 'Update Topic' : 'Create Topic')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}