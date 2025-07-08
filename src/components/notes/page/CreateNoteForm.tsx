
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Note } from '@/types/note';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CreateNoteFormProps {
  onSave: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  initialData?: Note;
}

export const CreateNoteForm = ({ onSave, initialData }: CreateNoteFormProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();

  // Initialize form with existing data when editing
  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setContent(initialData.content || '');
      setSelectedSubject(initialData.subject || '');
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !selectedSubject || !content.trim()) return;

    setIsSubmitting(true);
    try {
      // Find the subject_id for the selected subject name
      const selectedSubjectObj = userSubjects.find(s => s.name === selectedSubject);
      
      const noteData: Omit<Note, 'id'> = {
        title: title.trim(),
        description: description.trim(),
        content: content.trim(),
        date: initialData?.date || new Date().toISOString().split('T')[0],
        subject: selectedSubject || '',
        subject_id: selectedSubjectObj?.id || null,
        sourceType: initialData?.sourceType || 'manual',
        archived: initialData?.archived || false,
        pinned: initialData?.pinned || false,
        tags: initialData?.tags || []
      };

      const result = await onSave(noteData);
      if (result && !initialData) {
        // Reset form only for new notes (not when editing)
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
        <Label htmlFor="title">Title <span className="text-red-500">*</span></Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter note title..."
          required
        />
      </div>
      
      <div>
        <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
        <Select value={selectedSubject} onValueChange={setSelectedSubject} required>
          <SelectTrigger>
            <SelectValue placeholder="Select a subject" />
          </SelectTrigger>
          <SelectContent>
            {subjectsLoading ? (
              <SelectItem value="_loading" disabled>Loading subjects...</SelectItem>
            ) : userSubjects.length > 0 ? (
              userSubjects.map(subject => (
                <SelectItem key={subject.id} value={subject.name}>
                  {subject.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="_none" disabled>No subjects found</SelectItem>
            )}
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
        <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your note content..."
          rows={6}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="submit"
          disabled={!title.trim() || !selectedSubject || !content.trim() || isSubmitting}
          className="bg-mint-600 hover:bg-mint-700"
        >
          {isSubmitting ? (initialData ? 'Updating...' : 'Creating...') : (initialData ? 'Update Note' : 'Create Note')}
        </Button>
      </div>
    </form>
  );
};
