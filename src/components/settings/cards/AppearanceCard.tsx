
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface AppearanceCardProps {
  settings: {
    darkMode: boolean;
  };
  onSwitchChange: (name: string, checked: boolean) => void;
}

const AppearanceCard = ({ 
  settings, 
  onSwitchChange 
}: AppearanceCardProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Appearance</CardTitle>
        <CardDescription>
          Customize how the application looks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label>Dark Mode</Label>
            <p className="text-sm text-muted-foreground">
              Toggle dark mode on or off
            </p>
          </div>
          <Switch
            checked={settings.darkMode}
            onCheckedChange={(checked) =>
              onSwitchChange("darkMode", checked)
            }
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AppearanceCard;
