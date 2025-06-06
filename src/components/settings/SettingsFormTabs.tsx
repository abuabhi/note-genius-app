
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
import { UpgradeTierCard } from "./cards/UpgradeTierCard";
import { SubjectsSettingsCard } from "./cards/SubjectsSettingsCard";
import { StudyPreferencesCard } from "./cards/StudyPreferencesCard";
import { PasswordChangeCard } from "./cards/PasswordChangeCard";
import { AdaptiveLearningCard } from "./cards/AdaptiveLearningCard";
import { NotificationPreferencesCard } from "./cards/NotificationPreferencesCard";

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
      <TabsList className="grid grid-cols-4 mb-8 bg-white/60 backdrop-blur-sm border border-mint-100/50 shadow-lg">
        <TabsTrigger value="account" className="data-[state=active]:bg-mint-100 data-[state=active]:text-mint-800">Account</TabsTrigger>
        <TabsTrigger value="subjects" className="data-[state=active]:bg-mint-100 data-[state=active]:text-mint-800">Subjects</TabsTrigger>
        <TabsTrigger value="adaptive" className="data-[state=active]:bg-mint-100 data-[state=active]:text-mint-800">AI Learning</TabsTrigger>
        <TabsTrigger value="notifications" className="data-[state=active]:bg-mint-100 data-[state=active]:text-mint-800">Notifications</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account" className="space-y-6">
        {/* Upgrade Tier Card at the top for visibility */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-mint-400/10 to-blue-400/10 rounded-xl blur-xl"></div>
          <div className="relative">
            <UpgradeTierCard />
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-mint-500/5 to-blue-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <AccountSettingsCard 
              user={user}
              userTier={userTier}
              form={form}
              countries={countries}
              onCountryChange={onCountryChange}
            />
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-mint-500/5 to-blue-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <PasswordChangeCard />
          </div>
        </div>
        
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-mint-500/5 to-blue-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <StudyPreferencesCard form={form} />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="subjects" className="space-y-6">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-mint-500/5 to-blue-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <SubjectsSettingsCard />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="adaptive" className="space-y-6">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <AdaptiveLearningCard form={form} />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="notifications" className="space-y-6">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/5 to-mint-500/5 rounded-2xl blur-lg"></div>
          <div className="relative">
            <NotificationPreferencesCard form={form} />
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
};
