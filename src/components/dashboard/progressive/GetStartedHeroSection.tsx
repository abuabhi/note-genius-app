import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Star, Sparkles, Upload, BookOpen, Wand2 } from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const GetStartedHeroSection = () => {
  const today = format(new Date(), "EEEE, MMMM do");
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Fetch user profile data from database
  const { data: userProfile } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, username')
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

  // Check if user has any activity (to determine new vs returning)
  const { data: userActivity } = useQuery({
    queryKey: ["userActivity", user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Check for any notes, flashcard sets, or study sessions
      const [notesResult, flashcardsResult, sessionsResult] = await Promise.all([
        supabase.from('notes').select('id').eq('user_id', user.id).limit(1),
        supabase.from('flashcard_sets').select('id').eq('user_id', user.id).limit(1),
        supabase.from('study_sessions').select('id').eq('user_id', user.id).limit(1)
      ]);
      
      const hasActivity = (notesResult.data && notesResult.data.length > 0) ||
                         (flashcardsResult.data && flashcardsResult.data.length > 0) ||
                         (sessionsResult.data && sessionsResult.data.length > 0);
      
      return { hasActivity };
    },
    enabled: !!user,
  });

  // Get display name with proper fallbacks
  const getDisplayName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    if (userProfile?.username) {
      return userProfile.username;
    }
    if (user?.email) {
      const emailPart = user.email.split('@')[0];
      const firstName = emailPart.split('.')[0];
      return firstName.charAt(0).toUpperCase() + firstName.slice(1);
    }
    return 'there';
  };

  // Determine if user is new or returning
  const isReturningUser = userActivity?.hasActivity || false;
  const displayName = getDisplayName();

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
                  {isReturningUser ? `Welcome back, ${displayName}!` : `Welcome to PrepGenie, ${displayName}!`}
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

      {/* Primary CTA: Upload → Flashcards (the "magic moment") */}
      <Card className="bg-white border-2 border-mint-300 shadow-xl relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-gradient-to-br from-mint-100 to-blue-100 rounded-full blur-3xl opacity-60 pointer-events-none" />
        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-mint-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                <Wand2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1 px-2 py-0.5 mb-2 rounded-full bg-mint-100 text-mint-700 text-xs font-semibold uppercase tracking-wide">
                  <Sparkles className="h-3 w-3" /> Fastest way to start
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                  Upload a PDF → get flashcards in 60 seconds
                </h2>
                <p className="text-gray-600 text-sm md:text-base">
                  Drop a lecture slide, textbook chapter or note — we'll turn it into a study set instantly.
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/notes?action=upload')}
              size="lg"
              className="bg-mint-600 hover:bg-mint-700 text-white font-semibold px-6 py-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 whitespace-nowrap"
            >
              <Upload className="h-5 w-5 mr-2" />
              Upload PDF
            </Button>
          </div>

          {/* Secondary action — much smaller, lower visual weight */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Or start from scratch</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/notes')}
              className="text-mint-700 hover:text-mint-800 hover:bg-mint-50"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              Create a blank note
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};