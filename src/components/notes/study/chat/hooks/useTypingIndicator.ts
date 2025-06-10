
import { useState, useEffect } from 'react';

export const useTypingIndicator = (isLoading: boolean, delay: number = 500) => {
  const [showTyping, setShowTyping] = useState(false);

  useEffect(() => {
    if (isLoading) {
      const timer = setTimeout(() => {
        setShowTyping(true);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      setShowTyping(false);
    }
  }, [isLoading, delay]);

  return showTyping;
};
