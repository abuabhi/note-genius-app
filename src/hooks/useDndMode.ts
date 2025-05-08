
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type DndSettings = {
  enabled: boolean;
  startTime: string | null;
  endTime: string | null;
};

export const useDndMode = () => {
  const { user } = useAuth();
  const [dndSettings, setDndSettings] = useState<DndSettings>({
    enabled: false,
    startTime: null,
    endTime: null,
  });
  const [loading, setLoading] = useState(true);
  const [isDndActive, setIsDndActive] = useState(false);

  const fetchDndSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('do_not_disturb, dnd_start_time, dnd_end_time')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setDndSettings({
        enabled: data.do_not_disturb || false,
        startTime: data.dnd_start_time || null,
        endTime: data.dnd_end_time || null,
      });
    } catch (error) {
      console.error('Error fetching DND settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateDndSettings = async (settings: DndSettings) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          do_not_disturb: settings.enabled,
          dnd_start_time: settings.startTime,
          dnd_end_time: settings.endTime,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      setDndSettings(settings);
      toast.success('Do Not Disturb settings updated');
      return true;
    } catch (error) {
      console.error('Error updating DND settings:', error);
      toast.error('Failed to update Do Not Disturb settings');
      return false;
    }
  };

  const toggleDndMode = async (enabled: boolean) => {
    return updateDndSettings({
      ...dndSettings,
      enabled,
    });
  };

  // Check if DND is currently active based on schedule or manual setting
  useEffect(() => {
    const checkDndStatus = () => {
      if (dndSettings.enabled) {
        // If DND is enabled without a time range, it's always active
        if (!dndSettings.startTime || !dndSettings.endTime) {
          setIsDndActive(true);
          return;
        }

        // Check if current time is within DND hours
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        
        const [startHours, startMinutes] = dndSettings.startTime.split(':').map(Number);
        const startTimeMinutes = startHours * 60 + startMinutes;
        
        const [endHours, endMinutes] = dndSettings.endTime.split(':').map(Number);
        const endTimeMinutes = endHours * 60 + endMinutes;

        if (startTimeMinutes <= endTimeMinutes) {
          // Simple case: start time is before end time (same day)
          setIsDndActive(currentTime >= startTimeMinutes && currentTime <= endTimeMinutes);
        } else {
          // Complex case: end time is on the next day (e.g., 10:00 PM - 6:00 AM)
          setIsDndActive(currentTime >= startTimeMinutes || currentTime <= endTimeMinutes);
        }
      } else {
        setIsDndActive(false);
      }
    };

    checkDndStatus();
    const interval = setInterval(checkDndStatus, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [dndSettings]);

  useEffect(() => {
    if (user) {
      fetchDndSettings();
    }
  }, [user]);

  return {
    dndSettings,
    isDndActive,
    loading,
    fetchDndSettings,
    updateDndSettings,
    toggleDndMode,
  };
};
