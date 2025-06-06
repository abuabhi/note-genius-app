
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnnouncementFormData } from '../types';

interface TargetingSectionProps {
  control: Control<AnnouncementFormData>;
}

// Comprehensive list of all pages in the application
const ALL_PAGES = [
  { value: 'all', label: 'All Pages' },
  { value: '/', label: 'Home' },
  { value: '/dashboard', label: 'Dashboard' },
  { value: '/notes', label: 'Notes' },
  { value: '/flashcards', label: 'Flashcards' },
  { value: '/quiz', label: 'Quiz' },
  { value: '/study-sessions', label: 'Study Sessions' },
  { value: '/progress', label: 'Progress' },
  { value: '/goals', label: 'Goals' },
  { value: '/todos', label: 'Todos' },
  { value: '/reminders', label: 'Reminders' },
  { value: '/schedule', label: 'Schedule' },
  { value: '/collaboration', label: 'Collaboration' },
  { value: '/chat', label: 'Chat' },
  { value: '/connections', label: 'Connections' },
  { value: '/flashcard-library', label: 'Flashcard Library' },
  { value: '/settings', label: 'Settings' },
  { value: '/notifications', label: 'Notifications' },
  { value: '/admin', label: 'Admin Dashboard' },
  { value: '/admin/users', label: 'Admin Users' },
  { value: '/admin/announcements', label: 'Admin Announcements' },
  { value: '/admin/features', label: 'Admin Features' },
  { value: '/admin/analytics', label: 'Admin Analytics' },
  { value: '/admin/csv-import', label: 'Admin CSV Import' },
  { value: '/admin/subjects', label: 'Admin Subjects' },
  { value: '/admin/sections', label: 'Admin Sections' },
  { value: '/admin/grades', label: 'Admin Grades' },
  { value: '/admin/flashcards', label: 'Admin Flashcards' },
  { value: '/create-flashcard', label: 'Create Flashcard' },
  { value: '/create-quiz', label: 'Create Quiz' },
  { value: '/note-to-flashcard', label: 'Note to Flashcard' },
  { value: '/quiz-history', label: 'Quiz History' },
  { value: '/note-study', label: 'Note Study' },
  { value: '/edit-note', label: 'Edit Note' },
  { value: '/edit-flashcard', label: 'Edit Flashcard' },
  { value: '/take-quiz', label: 'Take Quiz' },
  { value: '/about', label: 'About' },
  { value: '/contact', label: 'Contact' },
  { value: '/faq', label: 'FAQ' },
  { value: '/pricing', label: 'Pricing' },
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
              <FormLabel>Target Tier</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value || "all"}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target tier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="all">All Tiers</SelectItem>
                  <SelectItem value="SCHOLAR">Scholar</SelectItem>
                  <SelectItem value="PROFESSOR">Professor</SelectItem>
                  <SelectItem value="DEAN">Dean</SelectItem>
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
              <Select 
                onValueChange={(value) => {
                  // Convert to JSON string with a single value array
                  field.onChange(JSON.stringify([value]));
                }}
                defaultValue={
                  field.value 
                    ? JSON.parse(field.value)[0] || 'all'
                    : 'all'
                }
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target page" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="max-h-60">
                  {ALL_PAGES.map((page) => (
                    <SelectItem key={page.value} value={page.value}>
                      {page.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose which page(s) should display this announcement
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Priority</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value || "medium"}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
            <FormDescription>
              Higher priority announcements appear first
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
