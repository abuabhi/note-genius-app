import { useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AccountSettingsCard } from "./cards/AccountSettingsCard";
import { StudyPreferencesCard } from "./cards/StudyPreferencesCard";
import { NotificationPreferencesCard } from "./cards/NotificationPreferencesCard";
import { AdaptiveLearningCard } from "./cards/AdaptiveLearningCard";
import { SubjectsSettingsCard } from "./cards/SubjectsSettingsCard";
import { PasswordChangeCard } from "./cards/PasswordChangeCard";
import { MergedSubscriptionCard } from "./cards/MergedSubscriptionCard";
import { PrivacyDataCard } from "./cards/PrivacyDataCard";
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

/**
 * Tracks which tabs the user has opened. Once visited, a tab stays mounted so
 * its state (form values, queries) survives switching away. Tabs that have
 * never been opened don't mount their (sometimes expensive) content trees.
 */
const useVisitedTabs = (activeTab: string) => {
  const visitedRef = useRef<Set<string>>(new Set([activeTab]));
  useEffect(() => {
    visitedRef.current.add(activeTab);
  }, [activeTab]);
  return (tab: string) => visitedRef.current.has(tab) || tab === activeTab;
};

export const SettingsFormTabs = ({
  activeTab,
  setActiveTab,
  form,
  user,
  userTier,
  countries,
  onCountryChange,
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

  const isMounted = useVisitedTabs(activeTab);

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="flex w-full overflow-x-auto gap-2 md:grid md:grid-cols-7">
        {tabs.map(tab => (
          <TabsTrigger key={tab.id} value={tab.id} className="whitespace-nowrap">
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="account" className="space-y-6">
        {isMounted('account') && (
          <>
            <AccountSettingsCard
              user={user}
              form={form}
              countries={countries}
              onCountryChange={onCountryChange}
            />
            <PrivacyDataCard />
          </>
        )}
      </TabsContent>

      <TabsContent value="subjects" className="space-y-6">
        {isMounted('subjects') && <SubjectsSettingsCard />}
      </TabsContent>

      <TabsContent value="subscription" className="space-y-6">
        {isMounted('subscription') && <MergedSubscriptionCard />}
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        {isMounted('notifications') && <NotificationPreferencesCard form={form} />}
      </TabsContent>

      <TabsContent value="study" className="space-y-6">
        {isMounted('study') && <StudyPreferencesCard form={form} />}
      </TabsContent>

      <TabsContent value="adaptive" className="space-y-6">
        {isMounted('adaptive') && <AdaptiveLearningCard form={form} />}
      </TabsContent>

      <TabsContent value="password" className="space-y-6">
        {isMounted('password') && <PasswordChangeCard />}
      </TabsContent>
    </Tabs>
  );
};
