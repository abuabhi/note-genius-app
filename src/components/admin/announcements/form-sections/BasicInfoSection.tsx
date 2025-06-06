
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/ui/rich-text/RichTextEditor';
import { SchedulingSection } from './SchedulingSection';
import { AnnouncementFormData } from '../types';

interface BasicInfoSectionProps {
  control: Control<AnnouncementFormData>;
}

export const BasicInfoSection = ({ control }: BasicInfoSectionProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title (Admin Reference Only)</FormLabel>
            <FormControl>
              <Input placeholder="Enter a title for internal reference" {...field} />
            </FormControl>
            <FormDescription>
              This title is for your reference only and won't be displayed to users
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="content"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Announcement Content</FormLabel>
            <FormControl>
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                defaultAlignment="center"
                placeholder="Enter the announcement content"
              />
            </FormControl>
            <FormDescription>
              This text will appear in the announcement bar. You can format it with the rich text controls.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <div>
        <h4 className="text-md font-medium mb-4">Schedule</h4>
        <SchedulingSection control={control} />
      </div>
    </div>
  );
};
