
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormLabel } from '@/components/ui/form';
import { Note } from '@/types/note';
import { TagSelector } from '../TagSelector';
import { useNotes } from '@/contexts/NoteContext';
import { useNoteEnrichment } from '@/hooks/useNoteEnrichment';
import { useAuth } from '@/contexts/auth';
import { toast } from '@/components/ui/sonner';
import { NoteMetadataFields } from './form/NoteMetadataFields';
import { NoteContentField } from './form/NoteContentField';
import { FormSubmitButton } from './form/FormSubmitButton';
import { useUserSubjects } from '@/hooks/useUserSubjects';

// Updated schema to include subject_id
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.date(),
  subject_id: z.string().optional(),
  category: z.string().optional(),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateNoteFormProps {
  onSave: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  initialData?: Note;
}

export const CreateNoteForm = ({ onSave, initialData }: CreateNoteFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { availableCategories, getAllTags, updateNote, addCategory } = useNotes();
  const [selectedTags, setSelectedTags] = useState<{ id?: string; name: string; color: string }[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const { user } = useAuth();
  const { subjects } = useUserSubjects();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      subject_id: initialData?.subject_id || '',
      category: initialData?.category || '',
      content: initialData?.content || '',
    },
  });

  // Handle new category creation - only add if it doesn't match an existing subject
  const handleNewCategoryAdd = (newCategory: string) => {
    const isExistingSubject = subjects.some(subject => 
      subject.name.toLowerCase() === newCategory.toLowerCase()
    );
    
    if (!isExistingSubject) {
      // Add category to global state only if it's not an existing subject
      addCategory(newCategory);
    }
  };
  
  useEffect(() => {
    // Load available tags
    const loadTags = async () => {
      const tags = await getAllTags();
      setAvailableTags(tags);
    };

    loadTags();

    // Set initial tags if available
    if (initialData?.tags) {
      setSelectedTags(initialData.tags);
    }
  }, [getAllTags, initialData]);

  const handleEnhancedContent = (enhancedContent: string) => {
    console.log("Setting enhanced content:", enhancedContent);
    form.setValue('content', enhancedContent);
    toast.success("Content enhanced", {
      description: "Your note has been enhanced with AI"
    });
  };

  const onSubmit = async (values: FormValues) => {
    if (isSaving) return; // Prevent multiple submissions
    
    setIsSaving(true);
    console.log("Submitting form with values:", values);
    console.log("Selected tags:", selectedTags);
    
    try {
      // Convert content to left-aligned if it's a new note
      let processedContent = values.content;
      
      // If this is a new note (no initialData), ensure content is left-aligned
      if (!initialData && values.content) {
        // Simple approach to ensure left alignment without breaking existing formatting
        if (!processedContent.includes('text-align: left')) {
          processedContent = `<div style="text-align: left;">${processedContent}</div>`;
        }
      }
      
      const noteData: Omit<Note, 'id'> = {
        title: values.title,
        description: values.title, // Using title as description since we're removing description field
        date: values.date.toISOString().split('T')[0],
        category: values.category || '', 
        content: processedContent,
        subject_id: values.subject_id,
        sourceType: initialData?.sourceType || 'manual',
        tags: selectedTags,
      };
      
      console.log("Saving note with data:", noteData);
      const result = await onSave(noteData);
      console.log("Save result:", result);
      
      // Reset form if it's a new note (not initialData) and the save was successful
      if (result && !initialData) {
        form.reset({
          title: '',
          date: new Date(),
          subject_id: '',
          category: '',
          content: '',
        });
        setSelectedTags([]);
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast.error("Failed to save note", {
        description: "An error occurred while saving your note"
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <NoteMetadataFields 
            control={form.control} 
            availableCategories={availableCategories}
            onNewCategoryAdd={handleNewCategoryAdd}
            setValue={form.setValue}
          />

          <NoteContentField
            control={form.control}
            noteId={initialData?.id}
            noteTitle={form.getValues('title')}
            onEnhance={handleEnhancedContent}
            showGenerateButton={false}
          />

          <div>
            <FormLabel>Tags</FormLabel>
            <TagSelector
              availableTags={availableTags}
              selectedTags={selectedTags}
              onTagsChange={setSelectedTags}
            />
          </div>
        </div>

        <FormSubmitButton 
          isSaving={isSaving} 
          isUpdate={!!initialData} 
        />
      </form>
    </Form>
  );
};
