
import { useAuth } from "@/contexts/AuthContext";
import { useUserTier } from "@/hooks/useUserTier";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserTier } from "@/hooks/useRequireAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Bell, Star, Clock } from "lucide-react";
import { format } from "date-fns";

const tierLabels = {
  [UserTier.SCHOLAR]: "Scholar Plan",
  [UserTier.GRADUATE]: "Graduate Plan",
  [UserTier.MASTER]: "Master Plan",
  [UserTier.DEAN]: "Dean Plan",
};

export function WelcomeBanner() {
  const { user } = useAuth();
  const { userTier } = useUserTier();
  
  const { data: recentActivity } = useQuery({
    queryKey: ["recentActivity", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Fetch latest study session
      const { data: latestSession } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1);
      
      // Fetch total study hours
      const { data: studySessions } = await supabase
        .from('study_sessions')
        .select('duration')
        .eq('user_id', user.id)
        .not('duration', 'is', null);
      
      const totalStudyHours = studySessions?.reduce((acc, session) => 
        acc + (session.duration || 0), 0) / 3600 || 0;
      
      return {
        latestSession: latestSession?.[0],
        totalStudyHours: Math.round(totalStudyHours * 10) / 10,
      };
    },
    enabled: !!user,
  });

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "morning";
    if (hour < 17) return "afternoon";
    return "evening";
  };

  const username = user?.email?.split('@')[0] || "Scholar";
  const timeOfDay = getTimeOfDay();

  return (
    <Card className="mb-8 bg-gradient-to-r from-mint-50 to-mint-100 border-mint-200">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-mint-800">
                Good {timeOfDay}, {username}!
              </h2>
              {userTier && (
                <Badge variant="outline" className="bg-mint-200/50 text-mint-700 hover:bg-mint-200">
                  {tierLabels[userTier]}
                </Badge>
              )}
            </div>
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
            {recentActivity?.latestSession && (
              <div className="flex items-center gap-2">
                <div className="p-2 bg-mint-200 rounded-full">
                  <Clock className="h-4 w-4 text-mint-700" />
                </div>
                <div>
                  <p className="text-xs text-mint-600">Last study session</p>
                  <p className="font-medium text-mint-800">
                    {format(new Date(recentActivity.latestSession.created_at), "MMM d")} - {recentActivity.latestSession.title}
                  </p>
                </div>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-mint-200 rounded-full">
                <Star className="h-4 w-4 text-mint-700" />
              </div>
              <div>
                <p className="text-xs text-mint-600">Total study time</p>
                <p className="font-medium text-mint-800">
                  {recentActivity?.totalStudyHours || 0} hours
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="p-2 bg-mint-200 rounded-full">
                <Bell className="h-4 w-4 text-mint-700" />
              </div>
              <div>
                <p className="text-xs text-mint-600">Today's focus</p>
                <p className="font-medium text-mint-800">
                  {userTier && userTier !== UserTier.SCHOLAR 
                    ? "Keep up the momentum!" 
                    : "Start your study journey"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
