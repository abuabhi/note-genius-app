
import { Control } from "react-hook-form";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";

interface NoteMetadataFieldsProps {
  control: Control<any>;
  availableCategories: string[];
  onNewCategoryAdd?: (category: string) => void;
}

export const NoteMetadataFields = ({
  control,
  availableCategories,
  onNewCategoryAdd,
}: NoteMetadataFieldsProps) => {
  // State to track if we're in custom input mode
  const [isCustomInputMode, setIsCustomInputMode] = useState(false);
  const [customCategory, setCustomCategory] = useState("");

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input
                placeholder="Note title"
                className="border-mint-200 focus-visible:ring-mint-400"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="date"
        render={({ field }) => (
          <FormItem className="flex flex-col">
            <FormLabel>Date</FormLabel>
            <Popover>
              <PopoverTrigger asChild>
                <FormControl>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full border-mint-200 pl-3 text-left font-normal",
                      !field.value && "text-muted-foreground"
                    )}
                  >
                    {field.value ? (
                      format(field.value, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </FormControl>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-white" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  disabled={(date) =>
                    date > new Date() || date < new Date("1900-01-01")
                  }
                  initialFocus
                  className="bg-white pointer-events-auto"
                />
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
          <FormItem className="md:col-span-1">
            <FormLabel>Subject</FormLabel>
            <div className="flex gap-2">
              {!isCustomInputMode ? (
                <Select
                  onValueChange={(value) => {
                    if (value === "_custom") {
                      setIsCustomInputMode(true);
                      setCustomCategory("");
                      return;
                    }
                    field.onChange(value === "_none" ? "" : value);
                  }}
                  value={field.value || "_none"}
                >
                  <FormControl>
                    <SelectTrigger className="border-mint-200 focus:ring-mint-400 flex-1">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-white">
                    <SelectItem value="_none">Select subject</SelectItem>
                    {availableCategories.length > 0 && (
                      availableCategories
                        .filter(category => category && category.trim() !== '')
                        .map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))
                    )}
                    <SelectItem value="_custom">Add new subject...</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex w-full items-center gap-2">
                  <Input
                    placeholder="New subject"
                    className="border-mint-200 focus-visible:ring-mint-400"
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    autoFocus
                  />
                  <Button 
                    type="button" 
                    size="sm"
                    className="bg-mint-500 hover:bg-mint-600 text-white"
                    onClick={() => {
                      if (customCategory.trim() !== '') {
                        field.onChange(customCategory);
                        if (onNewCategoryAdd) {
                          onNewCategoryAdd(customCategory);
                        }
                        setIsCustomInputMode(false);
                      }
                    }}
                  >
                    Add
                  </Button>
                  <Button 
                    type="button" 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setIsCustomInputMode(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
