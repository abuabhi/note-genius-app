
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/contexts/auth";
import { settingsFormSchema, SettingsFormValues } from "@/components/settings/schemas/settingsFormSchema";

export const useSettingsFormState = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [showUnsavedChangesDialog, setShowUnsavedChangesDialog] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      email: user?.email || "user@example.com",
      language: "en",
      countryId: "",
      weeklyStudyGoalHours: 5,
      // Adaptive Learning defaults
      adaptiveDifficulty: "adaptive",
      studyStyle: "distributed", 
      preferredSessionLength: 45,
      maxDailyStudyTime: 180,
      breakFrequency: "moderate",
      adaptationSensitivity: "normal",
      enableRealTimeAdaptations: true,
      enableLearningPaths: true,
      // Notification defaults
      emailNotifications: true,
      inAppNotifications: true,
      adaptiveNotifications: true,
      studySessionReminders: true,
      goalDeadlineReminders: true,
      reminderFrequency: "15min",
      quietHoursEnabled: false,
      quietHoursStart: "22:00",
      quietHoursEnd: "08:00",
    },
    mode: "onBlur",
  });

  return {
    user,
    form,
    activeTab,
    setActiveTab,
    showUnsavedChangesDialog,
    setShowUnsavedChangesDialog,
    pendingNavigation,
    setPendingNavigation,
  };
};
