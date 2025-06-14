
import { useState, useEffect } from 'react';

export const useTimezone = () => {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Get user's timezone
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('🌍 Detected timezone:', userTimezone);
      setTimezone(userTimezone || 'UTC');
    } catch (error) {
      console.error('❌ Error detecting timezone:', error);
      setTimezone('UTC');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateTimezone = (newTimezone: string) => {
    console.log('🌍 Updating timezone to:', newTimezone);
    setTimezone(newTimezone);
    // In a real app, this would also save to user preferences
  };

  return { 
    timezone, 
    isLoading,
    updateTimezone
  };
};
