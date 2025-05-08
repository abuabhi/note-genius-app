
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useCountries } from "@/hooks/useCountries";
import { useUserTier } from "@/hooks/useUserTier";
import { UserTier } from "@/hooks/useRequireAuth";
import AccountSettingsCard from "./cards/AccountSettingsCard";
import NotificationsCard from "./cards/NotificationsCard";
import AppearanceCard from "./cards/AppearanceCard";

const SettingsForm = () => {
  const { userTier } = useUserTier();
  const { countries, userCountry, updateUserCountry } = useCountries();
  const { user } = useAuth();
  const isDeanUser = userTier === UserTier.DEAN;
  
  const [settings, setSettings] = useState({
    email: user?.email || "user@example.com",
    emailNotifications: true,
    studyReminders: true,
    darkMode: false,
    language: "en",
    countryId: "",
  });

  useEffect(() => {
    if (userCountry) {
      setSettings(prev => ({
        ...prev,
        countryId: userCountry.id
      }));
    }
  }, [userCountry]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleCountryChange = async (countryId: string) => {
    setSettings((prev) => ({
      ...prev,
      countryId,
    }));
    
    if (isDeanUser) {
      const result = await updateUserCountry(countryId);
      if (result.success) {
        toast.success("Country preference updated");
      } else {
        toast.error("Failed to update country preference");
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Settings saved successfully");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <AccountSettingsCard 
        user={user}
        userTier={userTier}
        settings={{
          email: settings.email,
          language: settings.language,
          countryId: settings.countryId
        }}
        countries={countries}
        onInputChange={handleInputChange}
        onCountryChange={handleCountryChange}
      />

      <NotificationsCard 
        settings={{
          emailNotifications: settings.emailNotifications,
          studyReminders: settings.studyReminders
        }}
        onSwitchChange={handleSwitchChange}
      />

      <AppearanceCard 
        settings={{
          darkMode: settings.darkMode
        }}
        onSwitchChange={handleSwitchChange}
      />

      <div className="flex justify-end">
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  );
};

export default SettingsForm;
