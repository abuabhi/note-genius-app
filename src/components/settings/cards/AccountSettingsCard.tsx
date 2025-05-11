
import { User } from "@supabase/supabase-js";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTier } from "@/hooks/useUserTier";
import { Country } from "@/hooks/useCountries";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "../schemas/settingsFormSchema";
import { AlertCircle } from "lucide-react";

interface AccountSettingsCardProps {
  user: User | null;
  userTier?: UserTier;
  form: UseFormReturn<SettingsFormValues>;
  countries: Country[];
  onCountryChange: (countryId: string) => Promise<void>;
}

export const AccountSettingsCard = ({
  user,
  userTier,
  form,
  countries,
  onCountryChange
}: AccountSettingsCardProps) => {
  const isDeanUser = userTier === UserTier.DEAN;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>
          Manage your account preferences and personal information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  disabled={!!user}
                  placeholder="Enter your email address"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="language"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Language</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your preferred language"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {isDeanUser && (
          <FormField
            control={form.control}
            name="countryId"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel>Country</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={onCountryChange}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your country" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name} ({country.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
                <p className="text-sm text-muted-foreground">
                  As a DEAN user, you can change your country preference
                </p>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

// Add a default export as well to ensure flexibility in how it can be imported
export default AccountSettingsCard;
