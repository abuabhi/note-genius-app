
import { Control, UseFormSetValue } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { useUserSubjects } from "@/hooks/useUserSubjects";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";

interface NoteMetadataFieldsProps {
  control: Control<any>;
  availableCategories: string[];
  onNewCategoryAdd: (category: string) => void;
  setValue: UseFormSetValue<any>;
}

export const NoteMetadataFields = ({
  control,
  availableCategories,
  onNewCategoryAdd,
  setValue
}: NoteMetadataFieldsProps) => {
  const { subjects, isLoading: loadingSubjects } = useUserSubjects();
  
  // Helper function to check if a category name matches an existing subject
  const isCategoryExistingSubject = (categoryName: string): boolean => {
    return subjects.some(subject => 
      subject.name.toLowerCase() === categoryName.toLowerCase()
    );
  };
  
  // Get unique categories that don't overlap with subjects
  const getUniqueCategories = () => {
    return availableCategories.filter(category => 
      category && 
      category.trim() !== '' && 
      !isCategoryExistingSubject(category)
    );
  };
  
  const uniqueCategories = getUniqueCategories();

  return (
    <>
      {/* Title Field */}
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input 
                placeholder="Note title" 
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Date Field */}
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
                      "w-full pl-3 text-left font-normal",
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
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* Subject Field */}
      <FormField
        control={control}
        name="subject_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject</FormLabel>
            <Select 
              onValueChange={(value) => {
                field.onChange(value);
                
                if (value === "General") {
                  field.onChange("");
                  setValue("category", "General");
                } else {
                  // For user subjects, find the name and update the category field
                  const selectedSubject = subjects.find(s => s.id === value);
                  if (selectedSubject) {
                    setValue("category", selectedSubject.name);
                  } else {
                    // For other categories without subject_id, use the value directly
                    setValue("category", value);
                  }
                }
              }} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>User Subjects</SelectLabel>
                  {loadingSubjects ? (
                    <SelectItem value="_loading" disabled>Loading subjects...</SelectItem>
                  ) : subjects.length > 0 ? (
                    subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="_none" disabled>No subjects found</SelectItem>
                  )}
                </SelectGroup>
                
                <SelectGroup>
                  <SelectLabel>Other Categories</SelectLabel>
                  <SelectItem value="General">General</SelectItem>
                  {uniqueCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      {/* Hidden field to store the category (needed for backward compatibility) */}
      <FormField
        control={control}
        name="category"
        render={({ field }) => (
          <input type="hidden" {...field} />
        )}
      />
    </>
  );
};
