
import { useState, useEffect } from 'react';

export const useTimezone = () => {
  const [timezone, setTimezone] = useState<string>('UTC');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      // Get user's timezone using Intl.DateTimeFormat
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      console.log('🌍 Detected user timezone:', userTimezone);
      setTimezone(userTimezone);
    } catch (error) {
      console.warn('⚠️ Could not detect timezone, falling back to UTC:', error);
      setTimezone('UTC');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { timezone, isLoading };
};
