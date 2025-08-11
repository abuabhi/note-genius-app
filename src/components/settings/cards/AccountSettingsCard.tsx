
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { User, FileText, MapPin, Clock, Smartphone } from 'lucide-react';
import { getTimezonesByRegion, getCurrentTimeInTimezone } from '@/utils/timezoneData';
import { AvatarPicker } from '@/components/settings/avatar/AvatarPicker';

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
  const timezonesByRegion = getTimezonesByRegion();

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
                  <Input placeholder="Enter your username" {...field} className="h-10" />
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
                    className="h-10"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Avatar Selection */}
        <FormField
          control={form.control}
          name="avatar_url"
          render={({ field }) => (
            <FormItem>
              <AvatarPicker value={field.value || ''} onChange={field.onChange} />
            </FormItem>
          )}
        />

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
                <Input placeholder="Enter your school or institution" {...field} className="h-10" />
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
                  <Select value={field.value || ''} onValueChange={(value) => {
                    field.onChange(value);
                    onCountryChange(value);
                  }}>
                    <FormControl>
                      <SelectTrigger className="h-10">
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
                      <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-80">
                      {Object.entries(timezonesByRegion).map(([region, timezones]) => (
                        <div key={region}>
                          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground border-b">
                            {region}
                          </div>
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value}>
                              <div className="flex flex-col">
                                <span>{tz.label}</span>
                                <span className="text-xs text-muted-foreground">
                                  Current: {getCurrentTimeInTimezone(tz.value)}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </div>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Current timezone info */}
          <div className="text-xs text-muted-foreground">
            Current time in selected timezone: {getCurrentTimeInTimezone(form.watch('timezone') || 'UTC')}
          </div>
        </div>

        {/* WhatsApp Integration */}
        <FormField
          control={form.control}
          name="whatsapp_phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                WhatsApp Phone Number (Optional)
              </FormLabel>
              <FormControl>
                <Input 
                  placeholder="+1234567890" 
                  {...field}
                  type="tel"
                  className="h-10"
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
