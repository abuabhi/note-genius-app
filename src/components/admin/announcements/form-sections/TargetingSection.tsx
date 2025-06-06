
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

const PAGE_OPTIONS = [
  { value: '["all"]', label: 'All Pages' },
  { value: '["/dashboard"]', label: 'Dashboard' },
  { value: '["/notes"]', label: 'Notes' },
  { value: '["/flashcards"]', label: 'Flashcards' },
  { value: '["/quiz"]', label: 'Quiz' },
  { value: '["/study-sessions"]', label: 'Study Sessions' },
  { value: '["/progress"]', label: 'Progress' },
  { value: '["/schedule"]', label: 'Schedule' },
  { value: '["/settings"]', label: 'Settings' },
  { value: '["/goals"]', label: 'Goals' },
  { value: '["/todos"]', label: 'Todos' },
  { value: '["/chat"]', label: 'Chat' },
  { value: '["/library"]', label: 'Library' },
  { value: '["/collaboration"]', label: 'Collaboration' },
];

export const TargetingSection = ({ control }: TargetingSectionProps) => {
  return (
    <div className="space-y-4">
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
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target pages" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {PAGE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Select which pages to show this announcement on</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="target_pages"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Custom Target Pages (Advanced)</FormLabel>
            <FormControl>
              <Input {...field} placeholder='Custom JSON array: ["/custom-page", "/another-page"]' />
            </FormControl>
            <FormDescription>Override with custom JSON array of page paths</FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
