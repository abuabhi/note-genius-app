
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
      username: "",
      email: user?.email || "",
      school: "",
      whatsapp_phone: "",
      avatar_url: user?.user_metadata?.avatar_url || "",
      country_id: "",
      timezone: "UTC",
      language: "en",
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
      // Fun & Feedback defaults
      enableConfettiCelebrations: true,
      enableAvatarFrames: true,
      enableDailyQuoteCard: true,
      enableSoundEffects: true,
      enableEmojiBurst: true,
      // Study Music defaults
      selectedStudyTracks: [],
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
