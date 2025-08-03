
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { UseFormReturn } from "react-hook-form";
import { QuizFormValues } from "../schema/quizFormSchema";

interface QuizMetadataFormProps {
  form: UseFormReturn<QuizFormValues>;
  userSubjects?: Array<{ id: string; name: string; }>;
}

export const QuizMetadataForm = ({ form, userSubjects }: QuizMetadataFormProps) => {
  
  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Quiz Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter quiz title" {...field} />
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
              <Textarea
                placeholder="Brief description of this quiz"
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="subjectId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Subject *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value || ""}>
              <FormControl>
                <SelectTrigger className={!field.value ? "text-muted-foreground" : ""}>
                  <SelectValue placeholder="Select a subject" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {userSubjects && userSubjects.length > 0 ? (
                  userSubjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="" disabled>
                    No subjects available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  );
};
