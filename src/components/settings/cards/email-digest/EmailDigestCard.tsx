
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { useEmailDigestPreferences } from "@/hooks/useEmailDigestPreferences";
import { DeliverySettingsSection } from "./DeliverySettingsSection";
import { ContentTypesSection } from "./ContentTypesSection";
import { ContentLimitsSection } from "./ContentLimitsSection";
import { TaskSettingsSection } from "./TaskSettingsSection";

export const EmailDigestCard = () => {
  const { preferences, loading, updatePreferences } = useEmailDigestPreferences();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-blue-600" />
            Email Digest Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          Email Digest Settings
        </CardTitle>
        <CardDescription>
          Get a personalized daily digest of your study progress, goals, and tasks
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <DeliverySettingsSection 
          preferences={preferences} 
          updatePreferences={updatePreferences}
        />
        
        <ContentTypesSection 
          preferences={preferences} 
          updatePreferences={updatePreferences}
        />
        
        <ContentLimitsSection 
          preferences={preferences} 
          updatePreferences={updatePreferences}
        />
        
        <TaskSettingsSection 
          preferences={preferences} 
          updatePreferences={updatePreferences}
        />
      </CardContent>
    </Card>
  );
};
