
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
import { AlertCircle, User as UserIcon } from "lucide-react";

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
    <Card className="bg-white/80 backdrop-blur-sm border-mint-100/50 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="bg-gradient-to-r from-mint-50/50 to-blue-50/30 border-b border-mint-100/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-mint-100 rounded-full flex items-center justify-center">
            <UserIcon className="h-5 w-5 text-mint-600" />
          </div>
          <div>
            <CardTitle className="text-mint-800">Account Settings</CardTitle>
            <CardDescription className="text-slate-600">
              Manage your account preferences and personal information
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-700 font-medium">Email address</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  disabled={!!user}
                  placeholder="Enter your email address"
                  className="bg-white/60 border-mint-200 focus:border-mint-400 focus:ring-mint-400/20"
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
              <FormLabel className="text-slate-700 font-medium">Language</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="Enter your preferred language"
                  className="bg-white/60 border-mint-200 focus:border-mint-400 focus:ring-mint-400/20"
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
                <FormLabel className="text-slate-700 font-medium">Country</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={onCountryChange}
                >
                  <FormControl>
                    <SelectTrigger className="bg-white/60 border-mint-200 focus:border-mint-400 focus:ring-mint-400/20">
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
                <div className="flex items-center gap-2 text-sm text-mint-600 bg-mint-50/50 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4" />
                  <span>As a DEAN user, you can change your country preference</span>
                </div>
              </FormItem>
            )}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default AccountSettingsCard;
