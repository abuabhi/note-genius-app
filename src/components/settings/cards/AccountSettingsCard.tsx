
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserTier } from "@/hooks/useRequireAuth";
import { Country } from "@/hooks/useCountries";
import { toast } from "sonner";
import { User } from "@supabase/supabase-js";

interface AccountSettingsCardProps {
  user: User | null;
  userTier?: UserTier;
  settings: {
    email: string;
    language: string;
    countryId: string;
  };
  countries: Country[];
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryChange: (countryId: string) => Promise<void>;
}

const AccountSettingsCard = ({
  user,
  userTier,
  settings,
  countries,
  onInputChange,
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
        <div className="space-y-2">
          <Label htmlFor="email">Email address</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={settings.email}
            onChange={onInputChange}
            disabled={!!user}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="language">Language</Label>
          <Input
            id="language"
            name="language"
            value={settings.language}
            onChange={onInputChange}
          />
        </div>
        
        {isDeanUser && (
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select
              value={settings.countryId}
              onValueChange={onCountryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name} ({country.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {isDeanUser && (
              <p className="text-sm text-muted-foreground">
                As a DEAN user, you can change your country preference
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountSettingsCard;
