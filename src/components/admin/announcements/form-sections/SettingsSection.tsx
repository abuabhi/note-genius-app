
import React from 'react';
import { Control } from 'react-hook-form';
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { AnnouncementFormData } from '../types';

interface SettingsSectionProps {
  control: Control<AnnouncementFormData>;
}

export const SettingsSection = ({ control }: SettingsSectionProps) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="dismissible"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Dismissible</FormLabel>
              <p className="text-sm text-muted-foreground">
                Allow users to dismiss this announcement
              </p>
            </div>
            <FormControl>
              <Switch
                checked={field.value}
                onCheckedChange={field.onChange}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
};
