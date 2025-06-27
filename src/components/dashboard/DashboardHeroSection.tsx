
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/auth/useAuth";

export const DashboardHeroSection = () => {
  const today = format(new Date(), "EEEE, MMMM do");
  const { user } = useAuth();
  
  // Get first name from user email or use fallback
  const getFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  const motivationalQuotes = [
    "Every expert was once a beginner. Keep learning!",
    "Success is the sum of small efforts repeated day in and day out.",
    "The beautiful thing about learning is that no one can take it away from you.",
    "Education is the most powerful weapon you can use to change the world.",
    "Learning never exhausts the mind. Keep growing!"
  ];

  const todayQuote = motivationalQuotes[new Date().getDay() % motivationalQuotes.length];

  return (
    <Card className="bg-gradient-to-r from-mint-500 to-blue-600 text-white border-none shadow-lg">
      <CardContent className="p-4">
        {/* Row 1: Welcome message and Date */}
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">
            Welcome back, {getFirstName()}!
          </h1>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="text-mint-100 text-sm">{today}</span>
          </div>
        </div>
        
        {/* Row 2: Motivational Quote */}
        <p className="text-mint-100 text-sm italic">
          "{todayQuote}"
        </p>
      </CardContent>
    </Card>
  );
};
