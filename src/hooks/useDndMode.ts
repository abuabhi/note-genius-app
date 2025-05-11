
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { toast } from "sonner";

// Define the DndSettings type
export interface DndSettings {
  enabled: boolean;
  startTime: string | null;
  endTime: string | null;
  enabledDays: string[] | null;
}

export const useDndMode = () => {
  const { user } = useAuth();
  const [dndSettings, setDndSettings] = useState<DndSettings>({
    enabled: false,
    startTime: null,
    endTime: null,
    enabledDays: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchDndSettings = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from("user_settings")
          .select("dnd_enabled, dnd_start_time, dnd_end_time, dnd_days")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching DND settings:", error);
          toast.error("Failed to load DND settings");
        }

        if (data) {
          setDndSettings({
            enabled: data.dnd_enabled || false,
            startTime: data.dnd_start_time,
            endTime: data.dnd_end_time,
            enabledDays: data.dnd_days,
          });
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDndSettings();
  }, [user]);

  // Function to toggle DND mode
  const toggleDnd = async () => {
    if (!user) return false;

    try {
      const newEnabledState = !dndSettings.enabled;
      
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          dnd_enabled: newEnabledState,
          dnd_start_time: dndSettings.startTime,
          dnd_end_time: dndSettings.endTime,
          dnd_days: dndSettings.enabledDays,
        })
        .select();

      if (error) throw error;

      setDndSettings((prev) => ({ ...prev, enabled: newEnabledState }));
      
      toast.success(
        newEnabledState ? "Do Not Disturb mode enabled" : "Do Not Disturb mode disabled"
      );
      
      return true;
    } catch (error) {
      console.error("Error toggling DND mode:", error);
      toast.error("Failed to update DND settings");
      return false;
    }
  };

  // Function to update DND settings
  const updateDndSettings = async (newSettings: DndSettings) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          dnd_enabled: newSettings.enabled,
          dnd_start_time: newSettings.startTime,
          dnd_end_time: newSettings.endTime,
          dnd_days: newSettings.enabledDays,
        })
        .select();

      if (error) throw error;

      setDndSettings(newSettings);
      toast.success("DND settings updated");
      return true;
    } catch (error) {
      console.error("Error updating DND settings:", error);
      toast.error("Failed to update DND settings");
      return false;
    }
  };

  // Check if DND is currently active
  const isDndActive = dndSettings.enabled;

  return {
    dndSettings,
    isDndActive,
    isLoading,
    updateDndSettings,
    toggleDnd,
  };
};
