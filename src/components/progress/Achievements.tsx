
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AchievementItem } from "@/components/progress/AchievementItem";
import { useAuth } from "@/contexts/auth";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  created_at: string;
  achievement?: Achievement;
}

export const Achievements = () => {
  const { user } = useAuth();
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const fetchAchievements = async () => {
      if (!user) return;
      
      setLoading(true);
      try {
        // Since there's no achievements table, we'll create sample achievements
        const sampleAchievements = [
          { 
            id: "1", 
            achievement_id: "1",
            created_at: new Date().toISOString(),
            achievement: {
              id: "1",
              name: "First Note",
              description: "Created your first note",
              icon: "FileText",
              type: "note"
            }
          },
          {
            id: "2", 
            achievement_id: "2",
            created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
            achievement: {
              id: "2",
              name: "Study Streak",
              description: "Studied for 3 consecutive days",
              icon: "CalendarDays",
              type: "study"
            }
          },
          {
            id: "3", 
            achievement_id: "3",
            created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
            achievement: {
              id: "3",
              name: "Flashcard Master",
              description: "Mastered 50 flashcards",
              icon: "Cards",
              type: "flashcard"
            }
          }
        ];
        
        setAchievements(sampleAchievements);
      } catch (error) {
        console.error("Error fetching achievements:", error);
        setAchievements([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAchievements();
  }, [user]);
  
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
                        name={achievement.achievement?.name || "Unknown Achievement"}
                        description={achievement.achievement?.description || "No description"}
                        icon={achievement.achievement?.icon || "Award"}
                        type={achievement.achievement?.type || "general"}
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
                  {achievements.map((achievement) => (
                    <AchievementItem
                      key={achievement.id}
                      name={achievement.achievement?.name || "Unknown Achievement"}
                      description={achievement.achievement?.description || "No description"}
                      icon={achievement.achievement?.icon || "Award"}
                      type={achievement.achievement?.type || "general"}
                      date={achievement.created_at}
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
