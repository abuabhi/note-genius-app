
import { Control } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import { EnhanceNoteButton } from "../../enrichment/EnhanceNoteButton";
import { RichTextEditor } from "@/components/ui/rich-text/RichTextEditor";

interface NoteContentFieldProps {
  control: Control<any>;
  noteId?: string;
  noteTitle?: string;
  onEnhance: (enhancedContent: string) => void;
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
          <div className="flex justify-between">
            <FormLabel>Content</FormLabel>
            {noteId && noteTitle && (
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
            />
          </FormControl>
        </FormItem>
      )}
    />
  );
};
