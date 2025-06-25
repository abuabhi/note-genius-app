
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save } from 'lucide-react';
import { Note } from '@/types/note';
import { useOptimizedNotes } from '@/contexts/OptimizedNotesContext';
import { useUserSubjects } from '@/hooks/useUserSubjects';
import { getOrCreateSubjectId } from '@/utils/subjectHelpers';
import { toast } from 'sonner';

interface EditNoteContentProps {
  note: Note;
}

const EditNoteContent = ({ note }: EditNoteContentProps) => {
  const navigate = useNavigate();
  const { updateNote, refreshNotes } = useOptimizedNotes();
  const { subjects: userSubjects, isLoading: subjectsLoading } = useUserSubjects();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: note.title,
    description: note.description,
    content: note.content || '',
    subject: note.subject
  });

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
