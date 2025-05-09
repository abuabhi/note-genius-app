
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

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  date: z.date(),
  category: z.string().min(1, 'Category is required'),
  content: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema> & { tags: { name: string; color: string }[] };

interface CreateNoteFormProps {
  onSave: (note: Omit<Note, 'id'>) => Promise<Note | null>;
  initialData?: Note;
}

export const CreateNoteForm = ({ onSave, initialData }: CreateNoteFormProps) => {
  const [isSaving, setIsSaving] = useState(false);
  const { availableCategories, getAllTags } = useNotes();
  const [selectedTags, setSelectedTags] = useState<{ id?: string; name: string; color: string }[]>([]);
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      date: initialData?.date ? new Date(initialData.date) : new Date(),
      category: initialData?.category || 'General',
      content: initialData?.content || '',
      tags: [],
    },
  });

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

  const onSubmit = async (values: FormValues) => {
    setIsSaving(true);
    try {
      const noteData: Omit<Note, 'id'> = {
        title: values.title,
        description: values.description,
        date: values.date.toISOString().split('T')[0],
        category: values.category,
        content: values.content,
        sourceType: initialData?.sourceType || 'manual',
        tags: selectedTags,
      };

      await onSave(noteData);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEnhancedContent = (enhancedContent: string) => {
    form.setValue('content', enhancedContent);
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
                  <Input placeholder="Note title" {...field} />
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
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea placeholder="Brief description" {...field} />
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
                          variant="outline"
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Category" 
                      {...field} 
                      list="categories"
                    />
                  </FormControl>
                  {availableCategories && availableCategories.length > 0 && (
                    <datalist id="categories">
                      {availableCategories.map((category, index) => (
                        <option key={index} value={category} />
                      ))}
                    </datalist>
                  )}
                  <FormDescription>
                    Choose an existing category or create a new one
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
                    className="min-h-[200px] font-mono"
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

        <Button type="submit" disabled={isSaving} className="w-full">
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isSaving ? 'Saving...' : initialData ? 'Update Note' : 'Create Note'}
        </Button>
      </form>
    </Form>
  );
};
