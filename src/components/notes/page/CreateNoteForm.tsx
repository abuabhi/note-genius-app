import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Note } from '@/types/note';
import { TagSelector } from '../TagSelector';
import { useNotes } from '@/contexts/NoteContext';
import { EnhanceNoteButton } from '../enrichment/EnhanceNoteButton';
import { toast } from 'sonner';
import { useNoteEnrichment } from '@/hooks/useNoteEnrichment';
import { useAuth } from '@/contexts/AuthContext';

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

  const generateSummary = async (content: string) => {
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
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder="Note title" {...field} className="border-purple-200 focus-visible:ring-purple-400" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Description</FormLabel>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => generateSummary(form.getValues('content'))}
                    disabled={isGeneratingSummary || !form.getValues('content')}
                    className="h-8 text-xs border-purple-200 hover:bg-purple-50 hover:text-purple-700"
                  >
                    {isGeneratingSummary ? (
                      <>
                        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      'Generate Bullet Points'
                    )}
                  </Button>
                </div>
                <FormControl>
                  <Textarea 
                    placeholder="Brief description or key points"
                    className="whitespace-pre-wrap border-purple-200 focus-visible:ring-purple-400"
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn('w-full pl-3 text-left font-normal border-purple-200 hover:bg-purple-50', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Subject" 
                      {...field} 
                      list="subjects"
                      className="border-purple-200 focus-visible:ring-purple-400"
                    />
                  </FormControl>
                  {availableCategories && availableCategories.length > 0 && (
                    <datalist id="subjects">
                      {availableCategories.map((category, index) => (
                        <option key={index} value={category} />
                      ))}
                    </datalist>
                  )}
                  <FormDescription>
                    Choose an existing subject or create a new one
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Content</FormLabel>
                  {initialData?.id && (
                    <EnhanceNoteButton 
                      noteId={initialData.id}
                      noteTitle={form.getValues('title')}
                      noteContent={field.value || ''}
                      onEnhance={handleEnhancedContent}
                    />
                  )}
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Note content"
                    className="min-h-[200px] font-mono border-purple-200 focus-visible:ring-purple-400"
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
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

        <Button type="submit" disabled={isSaving} className="w-full bg-purple-600 hover:bg-purple-700">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Saving...' : initialData ? 'Update Note' : 'Create Note'}
        </Button>
      </form>
    </Form>
  );
};
