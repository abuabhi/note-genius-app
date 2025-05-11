import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useAuth } from "@/contexts/auth"; // Updated import path

// Sample data - in a real app, this would come from your API
const generateData = (days: number) => {
  const data = [];
  const date = new Date();
  
  for (let i = days - 1; i >= 0; i--) {
    const currentDate = new Date();
    currentDate.setDate(date.getDate() - i);
    
    data.push({
      date: currentDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cardsStudied: Math.floor(Math.random() * 30) + 5,
      cardsLearned: Math.floor(Math.random() * 20),
      accuracyRate: Math.floor(Math.random() * 40) + 60, // 60-100%
    });
  }
  
  return data;
};

export const StudyStatsChart = () => {
  const [timeRange, setTimeRange] = useState<"7" | "30" | "90">("7");
  const [data, setData] = useState<any[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    // In a real app, you would fetch this data from your API
    // For now, we'll generate some sample data
    setData(generateData(parseInt(timeRange)));
  }, [timeRange, user]);
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Study Statistics</h2>
          <p className="text-muted-foreground">Track your daily flashcard activity</p>
        </div>
        
        <div className="w-full sm:w-[200px]">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as "7" | "30" | "90")}>
            <SelectTrigger>
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 Days</SelectItem>
              <SelectItem value="30">Last 30 Days</SelectItem>
              <SelectItem value="90">Last 90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Daily Activity</CardTitle>
          <CardDescription>Cards studied, cards learned, and accuracy over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{
                  top: 20,
                  right: 30,
                  left: 0,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="cardsStudied" name="Cards Studied" fill="#8884d8" />
                <Bar yAxisId="left" dataKey="cardsLearned" name="Cards Learned" fill="#82ca9d" />
                <Bar yAxisId="right" dataKey="accuracyRate" name="Accuracy %" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeRange === "7" ? "4.2" : timeRange === "30" ? "18.5" : "42.3"} hours
            </div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7" ? "+0.8" : timeRange === "30" ? "+3.2" : "+6.7"} hours from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeRange === "7" ? "84" : timeRange === "30" ? "78" : "82"}%
            </div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7" ? "+4" : timeRange === "30" ? "-2" : "+1"}% from previous period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Cards Mastered</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {timeRange === "7" ? "42" : timeRange === "30" ? "156" : "384"}
            </div>
            <p className="text-xs text-muted-foreground">
              {timeRange === "7" ? "+12" : timeRange === "30" ? "+37" : "+94"} from previous period
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
