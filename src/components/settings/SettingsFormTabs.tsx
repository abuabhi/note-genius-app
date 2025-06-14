
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettingsCard } from "./cards/AccountSettingsCard";
import { StudyPreferencesCard } from "./cards/StudyPreferencesCard";
import { NotificationPreferencesCard } from "./cards/NotificationPreferencesCard";
import { AdaptiveLearningCard } from "./cards/AdaptiveLearningCard";
import { SubjectsSettingsCard } from "./cards/SubjectsSettingsCard";
import { PasswordChangeCard } from "./cards/PasswordChangeCard";
import { UpgradeTierCard } from "./cards/UpgradeTierCard";
import { SubscriptionLimitsCard } from "./cards/SubscriptionLimitsCard";
import { SubscriptionManagementCard } from "./cards/SubscriptionManagementCard";
import { TimezoneSelector } from "./TimezoneSelector";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { User } from "@supabase/supabase-js";
import { UserTier } from "@/hooks/useUserTier";
import { Country } from "@/hooks/useCountries";
import { User as UserIcon, BookOpen, CreditCard, Bell, Brain, Zap, Lock } from "lucide-react";

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
  const tabs = [
    { id: 'account', label: 'Account', icon: UserIcon },
    { id: 'subjects', label: 'Subjects', icon: BookOpen },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'study', label: 'Study Preferences', icon: Brain },
    { id: 'adaptive', label: 'Adaptive Learning', icon: Zap },
    { id: 'password', label: 'Password', icon: Lock },
  ];

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        {tabs.slice(0, 4).map(tab => (
          <TabsTrigger key={tab.id} value={tab.id}>
            {tab.label}
          </TabsTrigger>
        ))}
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
      
      <TabsContent value="subjects" className="space-y-6">
        <SubjectsSettingsCard />
      </TabsContent>
      
      <TabsContent value="subscription" className="space-y-6">
        <SubscriptionManagementCard />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-6">
        <NotificationPreferencesCard form={form} />
      </TabsContent>
      
      <TabsContent value="study" className="space-y-6">
        <StudyPreferencesCard form={form} />
      </TabsContent>
      
      <TabsContent value="adaptive" className="space-y-6">
        <AdaptiveLearningCard form={form} />
      </TabsContent>
      
      <TabsContent value="password" className="space-y-6">
        <PasswordChangeCard />
      </TabsContent>
    </Tabs>
  );
};
