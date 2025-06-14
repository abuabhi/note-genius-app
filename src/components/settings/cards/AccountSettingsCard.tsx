
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimezoneSelector } from '../TimezoneSelector';
import { User, FileText, MapPin, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { UserTier } from '@/hooks/useUserTier';

interface AccountSettingsCardProps {
  form: any;
  user: any;
  userTier: UserTier;
  countries: any[];
  onCountryChange: (value: string) => void;
}

export const AccountSettingsCard: React.FC<AccountSettingsCardProps> = ({
  form,
  user,
  userTier,
  countries,
  onCountryChange,
}) => {
  const tierColors = {
    [UserTier.SCHOLAR]: "bg-gray-100 text-gray-800",
    [UserTier.GRADUATE]: "bg-blue-100 text-blue-800",
    [UserTier.MASTER]: "bg-purple-100 text-purple-800",
    [UserTier.DEAN]: "bg-amber-100 text-amber-800",
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Tier Display */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium text-gray-900">Current Plan</h4>
            <p className="text-sm text-gray-600">Your current subscription tier</p>
          </div>
          <Badge className={tierColors[userTier]}>
            {userTier}
          </Badge>
        </div>

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
                  <FormControl>
                    <TimezoneSelector
                      value={field.value}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
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
