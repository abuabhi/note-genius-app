
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormLabel } from '@/components/ui/form';
import { Note } from '@/types/note';
import { TagSelector } from '../TagSelector';
import { useNotes } from '@/contexts/NoteContext';
import { useNoteEnrichment } from '@/hooks/useNoteEnrichment';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/sonner';
import { NoteMetadataFields } from './form/NoteMetadataFields';
import { NoteContentField } from './form/NoteContentField';
import { FormSubmitButton } from './form/FormSubmitButton';

// Updated schema to remove description
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.date(),
  subject: z.string().optional(),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      subject: initialData?.category || '',
      content: initialData?.content || '',
    },
  });

  // Handle new category creation
  const handleNewCategoryAdd = (newCategory: string) => {
    // Add category to global state
    addCategory(newCategory);
    
    // We no longer automatically add the category as a tag here
  };
  
  // Generate a color based on a string (for subject tags)
  const generateColorFromString = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 60%)`;
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
    // We remove the automatic tag creation based on category here
  }, [getAllTags, initialData]);

  const handleEnhancedContent = (enhancedContent: string) => {
    console.log("Setting enhanced content:", enhancedContent);
    form.setValue('content', enhancedContent);
    toast("Content enhanced", {
      description: "Your note has been enhanced with AI"
    });
  };

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    console.log("Submitting form with values:", values);
    console.log("Selected tags:", selectedTags);
    
    try {
      // Clean up any special values
      let processedSubject = values.subject;
      if (processedSubject === '_none' || processedSubject === '_custom') {
        processedSubject = '';
      }
      
      const noteData: Omit<Note, 'id'> = {
        title: values.title,
        description: values.title, // Using title as description since we're removing description field
        date: values.date.toISOString().split('T')[0],
        category: processedSubject || '', // Map subject to category field, allow empty
        content: values.content,
        sourceType: initialData?.sourceType || 'manual',
        tags: selectedTags,
      };
      
      console.log("Saving note with data:", noteData);
      const result = await onSave(noteData);
      console.log("Save result:", result);
      
      if (result) {
        toast("Note saved", {
          description: "Your note has been successfully saved"
        });
      }
    } catch (error) {
      console.error("Error saving note:", error);
      toast("Failed to save note", {
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
