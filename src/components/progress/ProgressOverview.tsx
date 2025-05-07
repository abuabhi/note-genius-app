
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChartPie, ChartBar, Zap, Trophy, BookOpen, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFlashcards } from "@/contexts/FlashcardContext";

const ProgressOverview = () => {
  const { user } = useAuth();
  const { fetchFlashcards, fetchFlashcardSets } = useFlashcards();
  const [stats, setStats] = useState({
    completedCourses: 0,
    totalCourses: 12,
    completedQuizzes: 0,
    totalQuizzes: 30,
    flashcardAccuracy: 0,
    streakDays: 0,
    totalCardsMastered: 0,
    studyTimeHours: 0,
    totalSets: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // In a real app, we'd make API calls to get this data
        // For now, we'll use some mock data combined with real flashcard counts
        let flashcardCount = 0;
        let setCount = 0;
        
        try {
          // fetchFlashcards returns void, so we can't use its return value directly
          await fetchFlashcards();
          
          // We'll add a delay to allow the state update to complete
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // For now, we'll use a random number for flashcard count
          flashcardCount = Math.floor(Math.random() * 30) + 10;
        } catch (error) {
          console.error("Error fetching flashcards:", error);
        }
        
        try {
          const setsResponsePromise = fetchFlashcardSets();
          
          if (setsResponsePromise instanceof Promise) {
            try {
              const setsResponse = await setsResponsePromise;
              if (setsResponse && Array.isArray(setsResponse)) {
                setCount = setsResponse.length;
              }
            } catch (err) {
              console.error("Error resolving sets promise:", err);
            }
          }
        } catch (error) {
          console.error("Error fetching sets:", error);
        }
        
        setStats({
          completedCourses: Math.floor(Math.random() * 8) + 1,
          totalCourses: 12,
          completedQuizzes: Math.floor(Math.random() * 20) + 5,
          totalQuizzes: 30,
          flashcardAccuracy: Math.floor(Math.random() * 30) + 70, // 70-100%
          streakDays: Math.floor(Math.random() * 14) + 1,
          totalCardsMastered: Math.floor(flashcardCount * 0.7),
          studyTimeHours: Math.floor(Math.random() * 20) + 5,
          totalSets: setCount
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStats();
  }, [user, fetchFlashcards, fetchFlashcardSets]);

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
            <ChartPie className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-2xl font-bold">
                {stats.completedCourses}/{stats.totalCourses}
              </p>
              <Progress value={(stats.completedCourses / stats.totalCourses) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quiz Performance</CardTitle>
            <ChartBar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-2xl font-bold">
                {stats.completedQuizzes}/{stats.totalQuizzes}
              </p>
              <Progress value={(stats.completedQuizzes / stats.totalQuizzes) * 100} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Flashcard Accuracy</CardTitle>
            <ChartPie className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-2xl font-bold">{stats.flashcardAccuracy}%</p>
              <Progress value={stats.flashcardAccuracy} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-2xl font-bold">{stats.streakDays} days</p>
              <Progress value={(stats.streakDays / 30) * 100} />
            </div>
          </CardContent>
        </Card>
      </div>

      <h2 className="text-xl font-semibold mt-8 mb-4">Learning Summary</h2>
      <div className="grid gap-6 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">Total Cards Mastered</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCardsMastered}</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(stats.totalCardsMastered * 0.2)} past month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studyTimeHours} hrs</div>
            <p className="text-xs text-muted-foreground">+{Math.floor(stats.studyTimeHours * 0.1)} past month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">Achievements</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5/9</div>
            <p className="text-xs text-muted-foreground">+1 past month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-1">
            <div className="flex items-center space-x-2">
              <div className="bg-primary/10 p-1.5 rounded-full">
                <BookOpen className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-sm font-medium">Flashcard Sets</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSets}</div>
            <p className="text-xs text-muted-foreground">+{Math.ceil(stats.totalSets * 0.3)} past month</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Your Study Consistency</CardTitle>
        </CardHeader>
        <CardContent className="px-2">
          <div className="flex flex-wrap">
            {Array(30).fill(0).map((_, i) => {
              // Generate some fake data for the heatmap
              const intensity = Math.random();
              let bgColor = "bg-gray-100";
              
              if (intensity > 0.9) bgColor = "bg-green-500";
              else if (intensity > 0.7) bgColor = "bg-green-400";
              else if (intensity > 0.5) bgColor = "bg-green-300";
              else if (intensity > 0.3) bgColor = "bg-green-200";
              
              return (
                <div key={i} className="m-0.5 w-6 h-6 rounded-sm tooltip-container group relative cursor-pointer">
                  <div className={`w-full h-full ${bgColor} rounded-sm`}></div>
                  <div className="absolute invisible group-hover:visible bottom-7 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded py-1 px-2 whitespace-nowrap">
                    {new Date(Date.now() - (30 - i) * 24 * 60 * 60 * 1000).toLocaleDateString()}:
                    {intensity > 0.5 ? " Studied" : " No activity"}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressOverview;
