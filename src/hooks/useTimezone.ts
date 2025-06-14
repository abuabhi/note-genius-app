
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

  return { timezone, isLoading };
};
