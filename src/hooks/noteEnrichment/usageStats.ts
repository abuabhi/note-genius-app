
import { useState } from 'react';

export const usageStats = () => {
  const [remaining, setRemaining] = useState(10);
  
  const updateUsage = () => {
    setRemaining(prev => Math.max(0, prev - 1));
  };
  
  return {
    remaining,
    total: 10,
    used: 10 - remaining,
    updateUsage
  };
};

export default usageStats;
