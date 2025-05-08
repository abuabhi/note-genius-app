
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NotificationsCardProps {
  settings: {
    emailNotifications: boolean;
    studyReminders: boolean;
  };
  onSwitchChange: (name: string, checked: boolean) => void;
}

const NotificationsCard = ({ 
  settings, 
  onSwitchChange 
}: NotificationsCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Configure how you want to receive notifications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Email Notifications</Label>
            <p className="text-sm text-muted-foreground">
              Receive email updates about your study progress
            </p>
          </div>
          <Switch
            checked={settings.emailNotifications}
            onCheckedChange={(checked) =>
              onSwitchChange("emailNotifications", checked)
            }
          />
        </div>
        
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Study Reminders</Label>
            <p className="text-sm text-muted-foreground">
              Get reminded about your scheduled study sessions
            </p>
          </div>
          <Switch
            checked={settings.studyReminders}
            onCheckedChange={(checked) =>
              onSwitchChange("studyReminders", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default NotificationsCard;
