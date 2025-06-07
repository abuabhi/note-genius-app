
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettingsCard } from "./cards/AccountSettingsCard";
import { StudyPreferencesCard } from "./cards/StudyPreferencesCard";
import { NotificationPreferencesCard } from "./cards/NotificationPreferencesCard";
import { AdaptiveLearningCard } from "./cards/AdaptiveLearningCard";
import { SubjectsSettingsCard } from "./cards/SubjectsSettingsCard";
import { PasswordChangeCard } from "./cards/PasswordChangeCard";
import { UpgradeTierCard } from "./cards/UpgradeTierCard";
import { SubscriptionLimitsCard } from "./cards/SubscriptionLimitsCard";
import { TimezoneSelector } from "./TimezoneSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { User } from "@supabase/supabase-js";
import { UserTier } from "@/hooks/useUserTier";
import { Country } from "@/hooks/useCountries";

interface SettingsFormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  form: UseFormReturn<any>;
  user: User | null;
  userTier?: UserTier;
  countries: Country[];
  onCountryChange: (countryId: string) => Promise<void>;
}

export const SettingsFormTabs = ({
  activeTab,
  setActiveTab,
  form,
  user,
  userTier,
  countries,
  onCountryChange
}: SettingsFormTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="study">Study</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account" className="space-y-6">
        <AccountSettingsCard 
          user={user}
          userTier={userTier}
          form={form}
          countries={countries}
          onCountryChange={onCountryChange}
        />
        <Card>
          <CardHeader>
            <CardTitle>Timezone Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <TimezoneSelector />
          </CardContent>
        </Card>
        <PasswordChangeCard />
        <UpgradeTierCard />
        <SubscriptionLimitsCard />
      </TabsContent>
      
      <TabsContent value="study" className="space-y-6">
        <StudyPreferencesCard form={form} />
        <AdaptiveLearningCard form={form} />
        <SubjectsSettingsCard />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-6">
        <NotificationPreferencesCard form={form} />
      </TabsContent>
      
      <TabsContent value="advanced" className="space-y-6">
        {/* Advanced settings can be added here */}
        <div className="text-center py-8 text-gray-500">
          Advanced settings will be available soon.
        </div>
      </TabsContent>
    </Tabs>
  );
};
