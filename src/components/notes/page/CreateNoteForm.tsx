
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Note } from '@/types/note';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSecureNotes } from '@/hooks/security/useSecureNotes';
import { toast } from 'sonner';
import { Plus, X, Loader2, ExternalLink } from 'lucide-react';

const ADD_NEW_SENTINEL = '__add_new__';

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
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [isSavingSubject, setIsSavingSubject] = useState(false);
  const { subjects: userSubjects, isLoading: subjectsLoading, addSubject } = useUserSubjects();
  const { sanitizeNoteContent, sanitizeNoteText, validateNote } = useSecureNotes();

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
    
    console.log('📝 [CREATE FORM] Form submission attempt:', {
      title: title.trim(),
      selectedSubject,
      content: content.trim(),
      hasTitle: !!title.trim(),
      hasSubject: !!selectedSubject,
      hasContent: !!content.trim()
    });

    // SECURITY FIX: Comprehensive validation with security checks
    const validation = validateNote(title.trim(), description.trim(), content.trim());
    if (!validation.isValid) {
      console.log('❌ [CREATE FORM] Security validation failed:', validation.errors);
      toast.error(`Security validation failed: ${validation.errors.join(', ')}`);
      return;
    }

    // Enhanced validation - prevent empty subject default behavior
    if (!title.trim()) {
      console.log('❌ [CREATE FORM] Validation failed: Empty title');
      toast.error('Title is required');
      return;
    }
    
    if (!selectedSubject || selectedSubject.trim() === '') {
      console.log('❌ [CREATE FORM] Validation failed: No subject selected');
      toast.error('Please select a subject');
      return;
    }
    
    if (!content.trim()) {
      console.log('❌ [CREATE FORM] Validation failed: Empty content');
      toast.error('Content is required');
      return;
    }

    setIsSubmitting(true);
    console.log('📝 [CREATE FORM] ✅ Validation passed - proceeding with save');
    
    try {
      // Find the subject_id for the selected subject name
      const selectedSubjectObj = userSubjects.find(s => s.name === selectedSubject);
      console.log('📝 [CREATE FORM] Subject lookup:', {
        selectedSubject,
        selectedSubjectObj,
        userSubjectsCount: userSubjects.length
      });
      
      // SECURITY FIX: Sanitize all input data before saving
      const noteData: Omit<Note, 'id'> = {
        title: sanitizeNoteText(title.trim()),
        description: sanitizeNoteText(description.trim()),
        content: sanitizeNoteContent(content.trim()),
        date: initialData?.date || new Date().toISOString().split('T')[0],
        subject: sanitizeNoteText(selectedSubject),
        subject_id: selectedSubjectObj?.id || null,
        sourceType: initialData?.sourceType || 'manual',
        archived: initialData?.archived || false,
        pinned: initialData?.pinned || false,
        tags: initialData?.tags || []
      };

      console.log('📝 [CREATE FORM] Calling onSave with note data:', noteData);
      const result = await onSave(noteData);
      
      if (result && !initialData) {
        console.log('📝 [CREATE FORM] ✅ Note saved successfully - resetting form');
        // Reset form only for new notes (not when editing)
        setTitle('');
        setDescription('');
        setContent('');
        setSelectedSubject('');
      } else if (!result) {
        console.log('❌ [CREATE FORM] Save operation returned null/undefined');
      }
    } catch (error) {
      console.error('❌ [CREATE FORM] Error saving note:', error);
    } finally {
      setIsSubmitting(false);
      console.log('📝 [CREATE FORM] Form submission completed');
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
          maxLength={200}
          required
        />
      </div>
      
      <div>
        <Label htmlFor="subject">Subject <span className="text-red-500">*</span></Label>
        <Select 
          value={selectedSubject} 
          onValueChange={(value) => {
            console.log('📝 [CREATE FORM] Subject changed to:', value);
            setSelectedSubject(value);
          }}
          required
        >
          <SelectTrigger className={!selectedSubject ? 'border-red-200' : ''}>
            <SelectValue placeholder="Select a subject (required)" />
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
        {!selectedSubject && (
          <p className="text-sm text-red-500 mt-1">Please select a subject</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Brief description..."
          maxLength={500}
        />
      </div>

      <div>
        <Label htmlFor="content">Content <span className="text-red-500">*</span></Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Enter your note content..."
          maxLength={50000}
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
