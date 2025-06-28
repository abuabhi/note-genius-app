
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { FileText, BookOpen, TrendingUp, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

export const NotesAnalytics = () => {
  const { user } = useAuth();

  const { data: notesData, isLoading } = useQuery({
    queryKey: ['notes-analytics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const totalNotes = notes?.length || 0;
      const recentNotes = notes?.filter(note => new Date(note.created_at) >= sevenDaysAgo).length || 0;
      const monthlyNotes = notes?.filter(note => new Date(note.created_at) >= thirtyDaysAgo).length || 0;

      // Subject distribution
      const subjectCounts: Record<string, number> = {};
      notes?.forEach(note => {
        if (note.subject) {
          subjectCounts[note.subject] = (subjectCounts[note.subject] || 0) + 1;
        }
      });

      const subjectData = Object.entries(subjectCounts)
        .map(([subject, count]) => ({ subject, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Weekly creation trend
      const weeklyData = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
        
        const dayNotes = notes?.filter(note => {
          const noteDate = new Date(note.created_at);
          return noteDate >= dayStart && noteDate < dayEnd;
        }).length || 0;

        weeklyData.push({
          day: date.toLocaleDateString('en-US', { weekday: 'short' }),
          notes: dayNotes
        });
      }

      return {
        totalNotes,
        recentNotes,
        monthlyNotes,
        subjectData,
        weeklyData,
        avgNotesPerWeek: Math.round(monthlyNotes / 4)
      };
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!notesData) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-mint-50 to-mint-100 border-mint-200">
          <CardContent className="p-4 text-center">
            <FileText className="h-8 w-8 text-mint-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-mint-800">{notesData.totalNotes}</div>
            <p className="text-sm text-mint-600">Total Notes</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4 text-center">
            <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-800">{notesData.recentNotes}</div>
            <p className="text-sm text-blue-600">This Week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-800">{notesData.avgNotesPerWeek}</div>
            <p className="text-sm text-green-600">Avg/Week</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4 text-center">
            <BookOpen className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-800">{notesData.monthlyNotes}</div>
            <p className="text-sm text-purple-600">This Month</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Creation Trend */}
        <Card className="border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mint-800">
              Weekly Creation Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={notesData.weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="notes" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Subject Distribution */}
        <Card className="border-mint-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-mint-800">
              Notes by Subject
            </CardTitle>
          </CardHeader>
          <CardContent>
            {notesData.subjectData.length > 0 ? (
              <div className="space-y-3">
                {notesData.subjectData.map((item, index) => (
                  <div key={item.subject} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                      />
                      <span className="text-sm font-medium">{item.subject}</span>
                    </div>
                    <Badge variant="outline" className="text-mint-700 border-mint-300">
                      {item.count} notes
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No subject data available</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
