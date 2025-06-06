
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AnnouncementFormData } from '../types';

interface CallToActionSectionProps {
  control: Control<AnnouncementFormData>;
}

export const CallToActionSection = ({ control }: CallToActionSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="cta_text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Call-to-Action Text</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Learn More" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="cta_url"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Call-to-Action URL</FormLabel>
            <FormControl>
              <Input {...field} type="url" placeholder="https://example.com" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
