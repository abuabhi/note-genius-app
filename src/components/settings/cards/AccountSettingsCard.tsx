
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, FileText, MapPin, Clock } from 'lucide-react';

interface AccountSettingsCardProps {
  form: any;
  user: any;
  countries: any[];
  onCountryChange: (value: string) => void;
}

export const AccountSettingsCard: React.FC<AccountSettingsCardProps> = ({
  form,
  user,
  countries,
  onCountryChange,
}) => {
  // Get the available timezones
  const COMMON_TIMEZONES = [
    { value: 'UTC', label: 'UTC (Coordinated Universal Time)' },
    { value: 'America/New_York', label: 'Eastern Time (US & Canada)' },
    { value: 'America/Chicago', label: 'Central Time (US & Canada)' },
    { value: 'America/Denver', label: 'Mountain Time (US & Canada)' },
    { value: 'America/Los_Angeles', label: 'Pacific Time (US & Canada)' },
    { value: 'Europe/London', label: 'London (GMT/BST)' },
    { value: 'Europe/Paris', label: 'Central European Time' },
    { value: 'Europe/Berlin', label: 'Berlin' },
    { value: 'Asia/Tokyo', label: 'Tokyo' },
    { value: 'Asia/Shanghai', label: 'Shanghai' },
    { value: 'Asia/Kolkata', label: 'India Standard Time' },
    { value: 'Australia/Sydney', label: 'Sydney' },
    { value: 'Australia/Melbourne', label: 'Melbourne' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your username" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Enter your email" 
                    {...field} 
                    value={user?.email || ''}
                    disabled
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* School Information */}
        <FormField
          control={form.control}
          name="school"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                School/Institution
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter your school or institution" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Location Settings */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Location & Time
          </h4>
          
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="country_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Country</FormLabel>
                  <Select value={field.value || ''} onValueChange={onCountryChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {countries.map((country) => (
                        <SelectItem key={country.id} value={country.id}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="timezone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Timezone
                  </FormLabel>
                  <Select value={field.value || 'UTC'} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {COMMON_TIMEZONES.map((tz) => (
                        <SelectItem key={tz.value} value={tz.value}>
                          {tz.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* WhatsApp Integration */}
        <FormField
          control={form.control}
          name="whatsapp_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>WhatsApp Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input 
                  placeholder="+1234567890" 
                  {...field}
                  type="tel"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  );
};
