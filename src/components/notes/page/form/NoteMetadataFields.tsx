
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Control } from "react-hook-form";

interface NoteMetadataFieldsProps {
  control: Control<any>;
  isGeneratingSummary: boolean;
  onGenerateSummary: () => void;
  availableCategories: string[];
}

export const NoteMetadataFields = ({
  control,
  isGeneratingSummary,
  onGenerateSummary,
  availableCategories
}: NoteMetadataFieldsProps) => {
  return (
    <>
      <FormField
        control={control}
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
        control={control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <div className="flex justify-between items-center">
              <FormLabel>Description</FormLabel>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={onGenerateSummary}
                disabled={isGeneratingSummary}
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
          control={control}
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
          control={control}
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
    </>
  );
};
