import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Users, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useManagedInterval, useManagedTimeout } from '@/utils/performance';

export const RealTimeSignupCounter = () => {
  const [count, setCount] = useState(48792);
  const [recentSignups, setRecentSignups] = useState(0);
  const [shouldResetSignups, setShouldResetSignups] = useState(false);

  useEffect(() => {
    // Get real user count from database
    const getUserCount = async () => {
      try {
        const { count: userCount, error } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (!error && userCount !== null) {
          setCount(Math.max(48792, userCount)); // Ensure minimum for marketing
        }
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };

    getUserCount();
  }, []);

  // Managed interval for signup updates
  const updateSignups = () => {
    if (Math.random() > 0.7) { // 30% chance of update every 3 seconds
      setCount(prev => prev + 1);
      setRecentSignups(prev => prev + 1);
      setShouldResetSignups(true);
    }
  };

  useManagedInterval('signup-counter', updateSignups, 3000);

  // Managed timeout to reset recent signups
  useManagedTimeout('reset-signups', () => {
    setRecentSignups(0);
    setShouldResetSignups(false);
  }, shouldResetSignups ? 10000 : null);

  return (
    <div className="flex items-center justify-center gap-4 py-4 px-6 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-mint-600">
          <Users className="h-5 w-5" />
          <span className="font-bold text-lg">{count.toLocaleString()}</span>
        </div>
        <span className="text-gray-600 text-sm">students learning smarter</span>
      </div>
      
      {recentSignups > 0 && (
        <Badge variant="secondary" className="animate-pulse bg-mint-100 text-mint-700">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{recentSignups} today
        </Badge>
      )}
    </div>
  );
};