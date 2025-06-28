
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Star, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/auth/useAuth";
import { useActiveStudySessionData } from "@/hooks/useActiveStudySessionData";
import { StudySessionPromptCard } from "./StudySessionPromptCard";

export const EnhancedDashboardHeroSection = () => {
  const today = format(new Date(), "EEEE, MMMM do");
  const { user } = useAuth();
  const sessionData = useActiveStudySessionData();
  
  // Get first name from user email or use fallback
  const getFirstName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name.split(' ')[0];
    }
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      const firstName = emailPart.split('.')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
    return 'there';
  };

  return (
    <div className="space-y-4">
      {/* Welcome Header */}
      <Card className="bg-gradient-to-r from-mint-500 to-blue-600 text-white border-none shadow-lg relative overflow-hidden">
        <CardContent className="p-6 relative">
          {/* Decorative sparkles */}
          <div className="absolute inset-0 pointer-events-none">
            <Sparkles className="absolute top-4 right-16 h-5 w-5 text-mint-200 opacity-60" />
            <Star className="absolute top-8 left-1/3 h-4 w-4 text-blue-200 opacity-50" />
            <Sparkles className="absolute bottom-6 right-1/4 h-4 w-4 text-mint-300 opacity-70" />
            <Star className="absolute bottom-4 left-20 h-3 w-3 text-blue-300 opacity-60" />
          </div>

          <div className="flex items-center justify-between relative z-10">
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
        </CardContent>
      </Card>

      {/* Study Session Prompt */}
      <StudySessionPromptCard sessionData={sessionData} />
    </div>
  );
};
