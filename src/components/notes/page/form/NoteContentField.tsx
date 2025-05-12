
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { RichTextEditor } from "@/components/ui/rich-text/RichTextEditor";
import { EnhanceNoteButton } from "../../enrichment/EnhanceNoteButton";

interface NoteContentFieldProps {
  control: Control<any>;
  noteId?: string;
  noteTitle: string;
  onEnhance: (content: string) => void;
  showGenerateButton?: boolean;
  defaultAlignment?: 'left' | 'center' | 'right' | 'justify';
}

export const NoteContentField = ({ 
  control, 
  noteId, 
  noteTitle, 
  onEnhance,
  showGenerateButton = false,
  defaultAlignment = 'left'
}: NoteContentFieldProps) => {
  return (
    <FormField
      control={control}
      name="content"
      render={({ field }) => (
        <FormItem>
          <div className="flex items-center justify-between">
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
            <RichTextEditor 
              content={field.value || ''} 
              onChange={field.onChange} 
              defaultAlignment={defaultAlignment}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
