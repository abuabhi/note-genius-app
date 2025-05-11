
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "../schemas/settingsFormSchema";

interface DoNotDisturbCardProps {
  form: UseFormReturn<SettingsFormValues>;
}

export const DoNotDisturbCard: React.FC<DoNotDisturbCardProps> = ({ form }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Do Not Disturb</CardTitle>
        <CardDescription>
          Set quiet hours when you don't want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <FormField
          control={form.control}
          name="dndEnabled"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
              <div className="space-y-0.5">
                <FormLabel>Enable Do Not Disturb</FormLabel>
                <FormDescription>
                  Pause all notifications during specified hours
                </FormDescription>
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

        {form.watch('dndEnabled') && (
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="dndStartTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dndEndTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="time"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DoNotDisturbCard;
