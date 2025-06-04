
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { UseFormReturn } from "react-hook-form";
import { SettingsFormValues } from "./schemas/settingsFormSchema";
import { UserTier } from "@/hooks/useUserTier";
import { Country } from "@/hooks/useCountries";
import { User } from "@supabase/supabase-js";

import AccountSettingsCard from "./cards/AccountSettingsCard";
import { AppearanceCard } from "./cards/AppearanceCard";
import { NotificationsCard } from "./cards/NotificationsCard";
import { NotificationSettingsCard } from "./cards/NotificationSettingsCard";
import { DoNotDisturbCard } from "./cards/DoNotDisturbCard";
import { UpgradeTierCard } from "./cards/UpgradeTierCard";
import { SubjectsSettingsCard } from "./cards/SubjectsSettingsCard";
import { StudyPreferencesCard } from "./cards/StudyPreferencesCard";

interface SettingsFormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  form: UseFormReturn<SettingsFormValues>;
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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="subjects">Subjects</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account" className="space-y-6">
        {/* New Upgrade Tier Card added at the top for visibility */}
        <UpgradeTierCard />
        
        <AccountSettingsCard 
          user={user}
          userTier={userTier}
          form={form}
          countries={countries}
          onCountryChange={onCountryChange}
        />
        
        <StudyPreferencesCard form={form} />
        
        <AppearanceCard form={form} />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-6">
        <NotificationsCard form={form} />
        
        <NotificationSettingsCard form={form} userTier={userTier} />
        
        <DoNotDisturbCard form={form} />
      </TabsContent>
      
      <TabsContent value="subjects" className="space-y-6">
        <SubjectsSettingsCard />
      </TabsContent>
    </Tabs>
  );
};
