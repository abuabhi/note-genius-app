
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { EnhanceNoteButton } from '@/components/notes/enrichment/EnhanceNoteButton';
import { Control } from "react-hook-form";

interface NoteContentFieldProps {
  control: Control<any>;
  noteId?: string;
  noteTitle: string;
  onEnhance: (content: string) => void;
}

export const NoteContentField = ({
  control,
  noteId,
  noteTitle,
  onEnhance
}: NoteContentFieldProps) => {
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <div className="flex justify-between items-center">
            <FormLabel>Content</FormLabel>
            {noteId && (
              <EnhanceNoteButton 
                noteId={noteId}
                noteTitle={noteTitle}
                noteContent={field.value || ''}
                onEnhance={onEnhance}
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
  );
};
