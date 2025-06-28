
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import { Bell } from "lucide-react";
import { DeliveryMethodsSection } from "./notification-sections/DeliveryMethodsSection";
import { StudyRemindersSection } from "./notification-sections/StudyRemindersSection";
import { TimingSettingsSection } from "./notification-sections/TimingSettingsSection";
import { EmailDigestSettingsCard } from "./EmailDigestSettingsCard";
import { Separator } from "@/components/ui/separator";

interface NotificationPreferencesCardProps {
  form: UseFormReturn<any>;
}

export const NotificationPreferencesCard = ({ form }: NotificationPreferencesCardProps) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-blue-600" />
            Notification Preferences
          </CardTitle>
          <CardDescription>
            Configure how and when you receive study reminders and AI suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DeliveryMethodsSection form={form} />
          <StudyRemindersSection form={form} />
          <TimingSettingsSection form={form} />
        </CardContent>
      </Card>
      
      <EmailDigestSettingsCard />
    </div>
  );
};
