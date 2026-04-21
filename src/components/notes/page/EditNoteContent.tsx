
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, RotateCcw } from 'lucide-react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { getOrCreateSubjectId } from '@/utils/subjectHelpers';
import { toast } from 'sonner';
import { useNoteAutosave, readNoteAutosave, clearNoteAutosave } from '@/hooks/useNoteAutosave';

interface EditNoteContentProps {
  note: Note;
}

const EditNoteContent = ({ note }: EditNoteContentProps) => {
  const navigate = useNavigate();
  const { updateNote, refreshNotes } = useOptimizedNotes();
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();
  const [isLoading, setIsLoading] = useState(false);
  const [hasDraft, setHasDraft] = useState(false);

  const [formData, setFormData] = useState({
    title: note.title,
    description: note.description,
    content: note.content || '',
    subject: note.subject
  });

  // Detect existing autosaved draft on mount
  useEffect(() => {
    const draft = readNoteAutosave(note.id);
    if (draft && (draft.title !== note.title || draft.content !== (note.content || ''))) {
      setHasDraft(true);
    }
  }, [note.id, note.title, note.content]);

  // Persist edits to localStorage every 5s
  useNoteAutosave(note.id, {
    title: formData.title,
    content: formData.content,
    description: formData.description,
  });

  const restoreDraft = () => {
    const draft = readNoteAutosave(note.id);
    if (!draft) return;
    setFormData(prev => ({
      ...prev,
      title: draft.title,
      content: draft.content,
      description: draft.description ?? prev.description,
    }));
    setHasDraft(false);
    toast.success('Draft restored.');
  };

  const dismissDraft = () => {
    clearNoteAutosave(note.id);
    setHasDraft(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      console.log('🔄 Updating note with subject:', formData.subject);
      
      // Get or create the subject_id for the selected subject
      const subjectId = await getOrCreateSubjectId(formData.subject);
      
      console.log('📝 Subject ID obtained:', subjectId);

      // FIXED: Update both subject_id and legacy subject field
      const updateData = {
        ...formData,
        subject_id: subjectId,
        subject: formData.subject // Ensure legacy field is also updated
      };

      console.log('💾 Updating note with data:', updateData);

      await updateNote(note.id, updateData);

      console.log('✅ Note updated successfully');

      // Drop the autosaved draft now that changes are persisted server-side
      clearNoteAutosave(note.id);

      // Force refresh the notes list to clear any cache
      await refreshNotes();
      
      toast.success('Note updated successfully!');
      navigate('/notes');
    } catch (error) {
      console.error('❌ Error updating note:', error);
      toast.error('Failed to update note');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/notes')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Notes
        </Button>
        <h1 className="text-2xl font-bold">Edit Note</h1>
      </div>

      {hasDraft && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <div className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            <span>Unsaved changes from your last session were found.</span>
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="outline" onClick={dismissDraft}>
              Discard
            </Button>
            <Button type="button" size="sm" onClick={restoreDraft}>
              Restore draft
            </Button>
          </div>
        </div>
      )}

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle>Note Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter note title..."
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter note description..."
                rows={3}
              />
            </div>

            {/* Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Select
                value={formData.subject}
                onValueChange={(value) => handleInputChange('subject', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
                <SelectContent>
                  {!subjectsLoading && userSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.name}>
                      {subject.name}
                    </SelectItem>
                  ))}
                  {/* Allow custom subject input */}
                  <SelectItem value="custom">+ Add New Subject</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Custom subject input when "custom" is selected */}
              {formData.subject === 'custom' && (
                <Input
                  placeholder="Enter new subject name..."
                  value=""
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                  className="mt-2"
                />
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                placeholder="Enter note content..."
                rows={10}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/notes')}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditNoteContent;
