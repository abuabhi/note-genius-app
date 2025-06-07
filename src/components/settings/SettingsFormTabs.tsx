
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

export const SettingsFormTabs = () => {
  return (
    <Tabs defaultValue="account" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="study">Study</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="advanced">Advanced</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account" className="space-y-6">
        <AccountSettingsCard />
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
        <StudyPreferencesCard />
        <AdaptiveLearningCard />
        <SubjectsSettingsCard />
      </TabsContent>
      
      <TabsContent value="notifications" className="space-y-6">
        <NotificationPreferencesCard />
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
