
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Note } from '@/types/note';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateNoteFormProps {
  onSave: (note: Omit<Note, 'id'>) => Promise<Note | null>;
}

export const CreateNoteForm = ({ onSave }: CreateNoteFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { subjects } = useUserSubjects();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      const noteData: Omit<Note, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        date: new Date().toISOString().split('T')[0],
        category: selectedSubject || 'General',
        sourceType: 'manual',
        archived: false,
        pinned: false,
        tags: []
      };

      const result = await onSave(noteData);
      if (result) {
        // Reset form
        setTitle('');
        setDescription('');
        setContent('');
        setSelectedSubject('');
      }
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          required
        />
      </div>
      
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="General">General</SelectItem>
            {subjects.map(subject => (
              <SelectItem key={subject.id} value={subject.name}>
                {subject.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
        />
      </div>

      <div>
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your note content..."
          rows={6}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={!title.trim() || isSubmitting}
          className="bg-mint-600 hover:bg-mint-700"
        >
          {isSubmitting ? 'Creating...' : 'Create Note'}
        </Button>
      </div>
    </form>
  );
};
