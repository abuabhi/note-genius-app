import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AchievementItem } from "@/components/progress/AchievementItem";
import { useAuth } from "@/contexts/auth"; // Updated import path

export const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Fetch user-specific achievements
        const { data, error } = await supabase
          .from('user_achievements')
          .select(`
            id,
            achievement_id,
            achievements (
              name,
              description,
              icon,
              type
            ),
            created_at
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        setAchievements(data || []);
      } catch (error) {
        console.error("Error fetching achievements:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [user]);
  
  // Sample data for demonstration
  const sampleAchievements = [
    { id: "1", name: "First Note", description: "Created your first note", icon: "FileText", type: "note" },
    { id: "2", name: "Study Streak", description: "Studied for 3 consecutive days", icon: "CalendarDays", type: "study" },
    { id: "3", name: "Flashcard Master", description: "Mastered 50 flashcards", icon: "Cards", type: "flashcard" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Achievements</h2>
          <p className="text-muted-foreground">Track your progress and milestones</p>
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {loading ? (
                    <p>Loading achievements...</p>
                  ) : achievements.length > 0 ? (
                    achievements.map((achievement) => (
                      <AchievementItem
                        key={achievement.id}
                        name={achievement.achievements?.name || "Unknown Achievement"}
                        description={achievement.achievements?.description || "No description"}
                        icon={achievement.achievements?.icon || "Award"}
                        type={achievement.achievements?.type || "general"}
                        date={achievement.created_at}
                      />
                    ))
                  ) : (
                    <p>No achievements yet. Keep learning to unlock new milestones!</p>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>All Achievements</CardTitle>
              <Separator />
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-4">
                  {sampleAchievements.map((achievement) => (
                    <AchievementItem
                      key={achievement.id}
                      name={achievement.name}
                      description={achievement.description}
                      icon={achievement.icon}
                      type={achievement.type}
                      date={new Date().toLocaleDateString()}
                    />
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
