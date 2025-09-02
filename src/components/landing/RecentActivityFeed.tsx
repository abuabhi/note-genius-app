import React, { useState, useEffect } from 'react';
import { BookOpen, Brain, Target, Clock, User } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useActivityFeed } from '@/hooks/admin/useVideoAnalytics';

interface Activity {
  id: string;
  user: string;
  action: string;
  time: string;
  icon: React.ComponentType<any>;
  location?: string;
}

// Fallback activities for when database is empty
const fallbackActivities: Activity[] = [
  { id: '1', user: 'Sarah M.', action: 'created 50 flashcards', time: '2 min ago', icon: Brain, location: 'NYC' },
  { id: '2', user: 'Alex K.', action: 'completed study session', time: '3 min ago', icon: Clock, location: 'SF' },
  { id: '3', user: 'Emma L.', action: 'imported notes from PDF', time: '5 min ago', icon: BookOpen, location: 'London' },
  { id: '4', user: 'Mike R.', action: 'achieved study goal', time: '7 min ago', icon: Target, location: 'Toronto' },
  { id: '5', user: 'Lisa P.', action: 'scored 95% on quiz', time: '12 min ago', icon: Brain, location: 'Sydney' },
  { id: '6', user: 'David C.', action: 'imported lecture notes', time: '15 min ago', icon: BookOpen, location: 'Berlin' },
];

export const RecentActivityFeed = () => {
  const [visibleActivities, setVisibleActivities] = useState(fallbackActivities.slice(0, 3));
  const [currentIndex, setCurrentIndex] = useState(3);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisibleActivities(prev => {
        const newActivities = [...prev];
        // Add new activity at the top
        if (currentIndex < fallbackActivities.length) {
          newActivities.unshift(fallbackActivities[currentIndex]);
          setCurrentIndex(c => (c + 1) % fallbackActivities.length);
        } else {
          // Cycle through activities
          newActivities.unshift(fallbackActivities[currentIndex % fallbackActivities.length]);
          setCurrentIndex(c => (c + 1) % fallbackActivities.length);
        }
        // Keep only 3 activities
        return newActivities.slice(0, 3);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [currentIndex]);


  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-4 max-w-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span className="text-sm font-medium text-gray-700">Live Activity</span>
      </div>
      
      <div className="space-y-3">
        {visibleActivities.map((activity, index) => {
          const IconComponent = activity.icon;
          return (
            <div 
              key={`${activity.id}-${index}`} 
              className={`flex items-center gap-3 transition-all duration-500 ${
                index === 0 ? 'animate-in slide-in-from-top-2' : ''
              }`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs bg-mint-100 text-mint-700">
                  {activity.user.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-medium text-gray-900">{activity.user}</span>
                  {activity.location && (
                    <span className="text-gray-500">from {activity.location}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-600">
                  <IconComponent className="h-3 w-3" />
                  <span>{activity.action}</span>
                </div>
              </div>
              
              <span className="text-xs text-gray-500">{activity.time}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
