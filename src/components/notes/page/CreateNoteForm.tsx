
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useNotes } from '@/contexts/NoteContext';
import { TagSelector } from '../TagSelector';
import { Note } from '@/types/note';

interface CreateNoteFormProps {
  onSave: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  initialData?: Partial<Omit<Note, 'id'>>;
}

export const CreateNoteForm: React.FC<CreateNoteFormProps> = ({ onSave, initialData }) => {
  const { availableCategories } = useNotes();
  const [title, setTitle] = useState(initialData?.title || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [content, setContent] = useState(initialData?.content || '');
  const [category, setCategory] = useState(initialData?.category || 'Uncategorized');
  const [selectedTags, setSelectedTags] = useState<{ name: string; color: string; }[]>(
    initialData?.tags || []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newNote: Omit<Note, 'id'> = {
      title,
      description,
      content,
      category,
      date: new Date().toISOString().split('T')[0],
      sourceType: 'manual',
      tags: selectedTags
    };

    try {
      await onSave(newNote);
      resetForm();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setContent('');
    setCategory('Uncategorized');
    setSelectedTags([]);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor="title">Title</Label>
          <Input 
            id="title" 
            placeholder="Note title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="description">Brief Description</Label>
          <Input 
            id="description" 
            placeholder="Brief description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
          />
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Categories</SelectLabel>
                <SelectItem value="Uncategorized">Uncategorized</SelectItem>
                {availableCategories.filter(cat => cat !== 'Uncategorized').map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="content">Content</Label>
          <Textarea 
            id="content" 
            placeholder="Write your note here..." 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            rows={8}
            className="resize-none"
          />
        </div>
        
        <div className="space-y-1">
          <Label>Tags</Label>
          <TagSelector 
            selectedTags={selectedTags} 
            onTagsChange={setSelectedTags}
          />
        </div>
      </div>
      
      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? 'Saving...' : 'Save Note'}
      </Button>
    </form>
  );
};
