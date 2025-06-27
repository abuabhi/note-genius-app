
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Star, Sparkles } from "lucide-react";
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
      // Better name extraction logic
      const emailPart = user.email.split('@')[0];
      // Handle cases like "abhinav.paul.sharma" -> "Abhinav"
      const firstName = emailPart.split('.')[0];
      // Capitalize first letter
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
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
    <Card className="bg-gradient-to-r from-mint-500 to-blue-600 text-white border-none shadow-lg relative overflow-hidden">
      <CardContent className="p-6 relative">
        {/* Decorative sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          <Sparkles className="absolute top-4 right-16 h-5 w-5 text-mint-200 opacity-60" />
          <Star className="absolute top-8 left-1/3 h-4 w-4 text-blue-200 opacity-50" />
          <Sparkles className="absolute bottom-6 right-1/4 h-4 w-4 text-mint-300 opacity-70" />
          <Star className="absolute bottom-4 left-20 h-3 w-3 text-blue-300 opacity-60" />
          <div className="absolute top-6 left-1/2 h-2 w-2 bg-white rounded-full opacity-40"></div>
          <div className="absolute bottom-8 right-1/3 h-1.5 w-1.5 bg-mint-200 rounded-full opacity-50"></div>
        </div>

        {/* Row 1: Welcome message and Date */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-mint-200" />
              <h1 className="text-2xl font-bold">
                Welcome back, {getFirstName()}!
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-2 text-mint-100">
            <Calendar className="h-4 w-4" />
            <span className="text-sm font-medium">{today}</span>
          </div>
        </div>
        
        {/* Row 2: Motivational Quote */}
        <div className="relative z-10">
          <p className="text-mint-100 text-sm italic leading-relaxed">
            "{todayQuote}"
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
