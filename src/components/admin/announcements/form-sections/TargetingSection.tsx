
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnnouncementFormData } from '../types';

interface TargetingSectionProps {
  control: Control<AnnouncementFormData>;
}

export const TargetingSection = ({ control }: TargetingSectionProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="target_tier"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target User Tier</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="SCHOLAR">Scholar</SelectItem>
                <SelectItem value="DEAN">Dean</SelectItem>
                <SelectItem value="PROFESSOR">Professor</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="target_pages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Pages</FormLabel>
            <FormControl>
              <Input {...field} placeholder='["all"] or ["/dashboard", "/notes"]' />
            </FormControl>
            <FormDescription>JSON array of page paths</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
