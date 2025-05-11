
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';
import { toast } from 'sonner';

export interface DndSettings {
  enabled: boolean;
  startTime: string | null;
  endTime: string | null;
}

export const useDndMode = () => {
  const { user } = useAuth();
  const [dndSettings, setDndSettings] = useState<DndSettings>({
    enabled: false,
    startTime: null,
    endTime: null
  });
  const [isDndActive, setIsDndActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDndSettings = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('do_not_disturb, dnd_start_time, dnd_end_time')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data) {
          setDndSettings({
            enabled: data.do_not_disturb || false,
            startTime: data.dnd_start_time,
            endTime: data.dnd_end_time
          });
          
          // Check if DND is currently active based on time
          checkIfDndActive(data.do_not_disturb, data.dnd_start_time, data.dnd_end_time);
        }
      } catch (error) {
        console.error('Error fetching DND settings:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDndSettings();
    
    // Set up interval to check DND status every minute
    const intervalId = setInterval(() => {
      if (dndSettings.enabled) {
        checkIfDndActive(
          dndSettings.enabled,
          dndSettings.startTime,
          dndSettings.endTime
        );
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [user]);
  
  // Check if current time is within DND period
  const checkIfDndActive = (enabled: boolean, startTime: string | null, endTime: string | null) => {
    if (!enabled || !startTime || !endTime) {
      setIsDndActive(false);
      return;
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // minutes since midnight
    
    // Convert DND times to minutes since midnight
    const start = timeStringToMinutes(startTime);
    const end = timeStringToMinutes(endTime);
    
    // Check if current time is within DND period
    if (start <= end) {
      // Simple case: start time is before end time
      setIsDndActive(currentTime >= start && currentTime <= end);
    } else {
      // Complex case: DND period spans across midnight
      setIsDndActive(currentTime >= start || currentTime <= end);
    }
  };
  
  const timeStringToMinutes = (timeString: string): number => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const updateDndSettings = async (newSettings: DndSettings) => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          do_not_disturb: newSettings.enabled,
          dnd_start_time: newSettings.enabled ? newSettings.startTime : null,
          dnd_end_time: newSettings.enabled ? newSettings.endTime : null
        })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setDndSettings(newSettings);
      checkIfDndActive(
        newSettings.enabled,
        newSettings.startTime,
        newSettings.endTime
      );
      
      toast.success('Do Not Disturb settings updated');
      return true;
    } catch (error) {
      console.error('Error updating DND settings:', error);
      toast.error('Failed to update Do Not Disturb settings');
      return false;
    }
  };
  
  const toggleDnd = async () => {
    return updateDndSettings({
      ...dndSettings,
      enabled: !dndSettings.enabled
    });
  };
  
  return {
    dndSettings,
    isDndActive,
    isLoading,
    updateDndSettings,
    toggleDnd
  };
};
