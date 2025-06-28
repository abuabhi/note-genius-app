
import { useAuth } from "@/contexts/auth";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Calendar, Clock, TrendingUp, Zap, Star } from "lucide-react";
import { format } from "date-fns";
import { useUltraSimpleAnalytics } from "@/hooks/useUltraSimpleAnalytics";

export function WelcomeBanner() {
  const { user } = useAuth();
  const { analytics, isLoading } = useUltraSimpleAnalytics();
  
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error fetching user profile:', error);
        return null;
      }
      
      return data;
    },
    enabled: !!user,
  });

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const formatStudyTime = (minutes: number) => {
    if (minutes < 60) return `${minutes.toFixed(0)}m`;
    const hours = minutes / 60;
    if (hours < 1) return `${minutes.toFixed(0)}m`;
    return `${hours.toFixed(1)}h`;
  };

  // Get user's name from profile, fall back to first part of email if no username
  const displayName = userProfile?.username || user?.email?.split('@')[0] || "Genius";
  const timeOfDay = getTimeOfDay();

  if (isLoading) {
    return (
      <div className="mb-8 animate-pulse">
        <div className="h-48 bg-gray-100 rounded-xl border border-gray-200"></div>
      </div>
    );
  }

  return (
    <div className="mb-8 relative overflow-hidden rounded-xl bg-gradient-to-br from-mint-500 to-mint-600 text-white shadow-sm">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-white/3 to-transparent rounded-full transform translate-x-32 -translate-y-32"></div>
      
      <CardContent className="relative p-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          {/* Left side - Greeting */}
          <div className="space-y-4">
            <div>
              <h1 className="text-3xl lg:text-4xl font-semibold mb-2">
                Good {timeOfDay}, {displayName}! ✨
              </h1>
              <p className="text-mint-100 text-lg font-medium">
                {format(new Date(), "EEEE, MMMM d, yyyy")}
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-mint-100">
              <Calendar className="h-5 w-5" />
              <span className="font-medium">Ready to continue your learning journey?</span>
            </div>
          </div>
          
          {/* Right side - Key metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:gap-6 w-full lg:w-auto">
            {/* Today's Study Time */}
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-lg">
                  <Clock className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-mint-100 mb-1 font-medium">Today's Focus</p>
                  <p className="text-xl font-semibold text-white">
                    {formatStudyTime(analytics.todayStudyTimeMinutes)}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Study Time */}
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-mint-100 mb-1 font-medium">Total Progress</p>
                  <p className="text-xl font-semibold text-white">
                    {formatStudyTime(analytics.totalStudyTimeMinutes)}
                  </p>
                </div>
              </div>
            </div>

            {/* Study Streak */}
            <div className="bg-white/15 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/15 rounded-lg">
                  <Zap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-mint-100 mb-1 font-medium">Study Streak</p>
                  <p className="text-xl font-semibold text-white">
                    {analytics.streakDays} {analytics.streakDays === 1 ? 'day' : 'days'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section - Recent activity hint */}
        {analytics.recentSessions && analytics.recentSessions.length > 0 && (
          <div className="mt-6 pt-6 border-t border-white/15">
            <div className="flex items-center gap-2 text-mint-100">
              <Star className="h-4 w-4" />
              <span className="text-sm font-medium">
                Last session: {analytics.recentSessions[0].title} • {format(new Date(analytics.recentSessions[0].start_time), "MMM d")}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}
