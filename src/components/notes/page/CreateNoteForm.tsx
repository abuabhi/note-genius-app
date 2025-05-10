
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
import { toast } from 'sonner';
import { NoteMetadataFields } from './form/NoteMetadataFields';
import { NoteContentField } from './form/NoteContentField';
import { FormSubmitButton } from './form/FormSubmitButton';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.date(),
  subject: z.string().min(1, 'Subject is required'),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateNoteFormProps {
  onSave: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  initialData?: Note;
}

export const CreateNoteForm = ({ onSave, initialData }: CreateNoteFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const { availableCategories, getAllTags } = useNotes();
  const [selectedTags, setSelectedTags] = useState<{ id?: string; name: string; color: string }[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);
  const { user } = useAuth();
  const { enrichNote, isEnabled: enrichmentEnabled } = useNoteEnrichment();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      subject: initialData?.category || 'General',
      content: initialData?.content || '',
    },
  });

  useEffect(() => {
    // Load available tags
    const loadTags = async () => {
      const tags = await getAllTags();
      console.log("Available tags loaded:", tags);
      setAvailableTags(tags);
    };

    loadTags();

    // Set initial tags if available
    if (initialData?.tags) {
      console.log("Setting initial tags:", initialData.tags);
      setSelectedTags(initialData.tags);
    }
  }, [getAllTags, initialData]);

  const generateSummary = async () => {
    const content = form.getValues('content');
    if (!content || content.trim().length < 50) {
      toast("Content too short", {
        description: "Please add more content to generate a summary"
      });
      return;
    }
    
    setIsGeneratingSummary(true);
    try {
      console.log("Generating summary for content");
      
      // Use the enrichNote function to generate a bullet point summary
      const noteId = initialData?.id || 'temp-id-for-summary';
      console.log("Using noteId:", noteId);
      
      if (enrichNote) {
        const result = await enrichNote(
          noteId,
          content,
          'extract-key-points',
          form.getValues('title')
        );
        
        console.log("Enrichment result:", result);
        
        if (result) {
          // Format the result as bullet points if it's not already
          let summaryText = result;
          if (!summaryText.includes('•') && !summaryText.includes('-')) {
            summaryText = summaryText
              .split('\n')
              .filter(line => line.trim().length > 0)
              .map(line => `• ${line}`)
              .join('\n');
          }
          
          console.log("Setting description to:", summaryText);
          form.setValue('description', summaryText);
          toast("Summary generated", {
            description: "Key points extracted from your note content"
          });
        }
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast("Summary generation failed", {
        description: "Could not generate a summary from your note content"
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    console.log("Submitting form with values:", values);
    console.log("Selected tags:", selectedTags);
    
    try {
      const noteData: Omit<Note, 'id'> = {
        title: values.title,
        description: values.description,
        date: values.date.toISOString().split('T')[0],
        category: values.subject, // Map subject to category field
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

  const handleEnhancedContent = (enhancedContent: string) => {
    console.log("Setting enhanced content:", enhancedContent);
    form.setValue('content', enhancedContent);
    toast("Content enhanced", {
      description: "Your note has been enhanced with AI"
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <NoteMetadataFields 
            control={form.control} 
            isGeneratingSummary={isGeneratingSummary}
            onGenerateSummary={generateSummary}
            availableCategories={availableCategories}
          />

          <NoteContentField
            control={form.control}
            noteId={initialData?.id}
            noteTitle={form.getValues('title')}
            onEnhance={handleEnhancedContent}
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
