
import { useAuth } from "@/contexts/auth";
import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Star, Clock } from "lucide-react";
import { format } from "date-fns";
import { useConsolidatedAnalytics } from "@/hooks/useConsolidatedAnalytics";

export function WelcomeBanner() {
  const { user } = useAuth();
  const { analytics } = useConsolidatedAnalytics();
  
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

  // Get user's name from profile, fall back to first part of email if no username
  const displayName = userProfile?.username || user?.email?.split('@')[0] || "Scholar";
  const timeOfDay = getTimeOfDay();

  return (
    <Card className="mb-8 bg-gradient-to-r from-mint-50 to-mint-100 border-mint-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-mint-800">
              Good {timeOfDay}, {displayName}!
            </h2>
            <p className="text-mint-700">
              {new Date().toLocaleDateString(undefined, { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
          
          <div className="flex flex-wrap gap-4 md:gap-6">
            {/* Show latest session if available */}
            {analytics.recentSessions && analytics.recentSessions.length > 0 && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-mint-200 rounded-full">
                  <Clock className="h-4 w-4 text-mint-700" />
                </div>
                <div>
                  <p className="text-xs text-mint-600">Last study session</p>
                  <p className="font-medium text-mint-800">
                    {format(new Date(analytics.recentSessions[0].start_time), "MMM d")} - {analytics.recentSessions[0].title}
                  </p>
                </div>
              </div>
            )}
            
            {/* Show total study time */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-mint-200 rounded-full">
                <Star className="h-4 w-4 text-mint-700" />
              </div>
              <div>
                <p className="text-xs text-mint-600">Total study time</p>
                <p className="font-medium text-mint-800">
                  {analytics.totalStudyTime}h
                </p>
              </div>
            </div>
            
            {/* Show today's study time */}
            <div className="flex items-center gap-2">
              <div className="p-2 bg-mint-200 rounded-full">
                <Bell className="h-4 w-4 text-mint-700" />
              </div>
              <div>
                <p className="text-xs text-mint-600">Today's study time</p>
                <p className="font-medium text-mint-800">
                  {analytics.todayStudyTime}h
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
