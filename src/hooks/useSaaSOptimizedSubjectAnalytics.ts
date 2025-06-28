
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { getFallbackSubjectAnalytics, getFallbackRecommendations } from "@/utils/subjectAnalyticsUtils";

export interface SubjectAnalytics {
  id: string;
  name: string;
  completionPercentage: number;
  totalStudyTimeMinutes: number;
  sessionCount: number;
  lastActivity?: string;
  averageAccuracy?: number;
  masteredCards?: number;
  totalCards?: number;
}

export interface SaaSOptimizedSubjectAnalytics {
  subjects: SubjectAnalytics[];
  totalStudyTime: number; // in hours
  sessionsThisWeek: number;
  last7DaysFormatted: string;
  last30DaysFormatted: string;
  recommendations: any[];
}

export const useSaaSOptimizedSubjectAnalytics = () => {
  const { user } = useAuth();

  const { data: subjectAnalytics, isLoading, error } = useQuery({
    queryKey: ["saas-optimized-subject-analytics", user?.id],
    queryFn: async (): Promise<SaaSOptimizedSubjectAnalytics> => {
      if (!user?.id) {
        console.log("❌ No authenticated user found for analytics");
        throw new Error("User not authenticated");
      }

      console.log("🔍 Fetching analytics for user:", user.id);

      try {
        // Check authentication first
        const { data: { user: authUser } } = await supabase.auth.getUser();
        console.log("🔐 Auth check result:", authUser?.id);

        if (!authUser) {
          throw new Error("Authentication verification failed");
        }

        // Fetch flashcard sets directly with user ID
        const { data: flashcardSets, error: setsError } = await supabase
          .from('flashcard_sets')
          .select(`
            id,
            name,
            subject,
            card_count,
            created_at,
            updated_at
          `)
          .eq('user_id', user.id);

        if (setsError) {
          console.error("❌ Error fetching flashcard sets:", setsError);
        } else {
          console.log("📚 Found flashcard sets:", flashcardSets?.length || 0);
        }

        // Fetch study sessions directly with user ID
        const { data: studySessions, error: sessionsError } = await supabase
          .from('study_sessions')
          .select('*')
          .eq('user_id', user.id)
          .gte('start_time', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

        if (sessionsError) {
          console.error("❌ Error fetching study sessions:", sessionsError);
        } else {
          console.log("📖 Found study sessions:", studySessions?.length || 0);
        }

        // Fetch user subjects directly with user ID
        const { data: userSubjects, error: subjectsError } = await supabase
          .from('user_subjects')
          .select('*')
          .eq('user_id', user.id);

        if (subjectsError) {
          console.error("❌ Error fetching user subjects:", subjectsError);
        } else {
          console.log("🎯 Found user subjects:", userSubjects?.length || 0);
        }

        // Fetch flashcard progress directly with user ID
        const { data: flashcardProgress, error: progressError } = await supabase
          .from('user_flashcard_progress')
          .select(`
            *,
            flashcard (
              id,
              flashcard_set_cards (
                set_id,
                flashcard_sets (
                  id,
                  name,
                  subject
                )
              )
            )
          `)
          .eq('user_id', user.id);

        if (progressError) {
          console.error("❌ Error fetching flashcard progress:", progressError);
        } else {
          console.log("📊 Found flashcard progress:", flashcardProgress?.length || 0);
        }

        // Process the data to create unified analytics
        const subjectMap = new Map<string, SubjectAnalytics>();

        // Initialize with user subjects
        userSubjects?.forEach(subject => {
          subjectMap.set(subject.name, {
            id: subject.id,
            name: subject.name,
            completionPercentage: 0,
            totalStudyTimeMinutes: 0,
            sessionCount: 0,
            lastActivity: undefined,
            averageAccuracy: 0,
            masteredCards: 0,
            totalCards: 0
          });
        });

        // Add flashcard sets as subjects if not already present
        flashcardSets?.forEach(set => {
          const subjectName = set.subject || set.name;
          if (!subjectMap.has(subjectName)) {
            subjectMap.set(subjectName, {
              id: set.id,
              name: subjectName,
              completionPercentage: 0,
              totalStudyTimeMinutes: 0,
              sessionCount: 0,
              lastActivity: set.updated_at,
              averageAccuracy: 0,
              masteredCards: 0,
              totalCards: set.card_count || 0
            });
          } else {
            const existing = subjectMap.get(subjectName)!;
            existing.totalCards = (existing.totalCards || 0) + (set.card_count || 0);
            if (!existing.lastActivity || set.updated_at > existing.lastActivity) {
              existing.lastActivity = set.updated_at;
            }
          }
        });

        // Add study session data
        studySessions?.forEach(session => {
          if (session.subject) {
            const subject = subjectMap.get(session.subject);
            if (subject) {
              subject.sessionCount += 1;
              subject.totalStudyTimeMinutes += Math.floor((session.duration || 0) / 60);
              
              const sessionDate = new Date(session.start_time).toISOString();
              if (!subject.lastActivity || sessionDate > subject.lastActivity) {
                subject.lastActivity = sessionDate;
              }
            }
          }
        });

        // Calculate flashcard progress
        flashcardProgress?.forEach(progress => {
          const flashcardSet = progress.flashcard?.flashcard_set_cards?.[0]?.flashcard_sets;
          if (flashcardSet) {
            const subjectName = flashcardSet.subject || flashcardSet.name;
            const subject = subjectMap.get(subjectName);
            if (subject) {
              if ((progress.mastery_level || 0) >= 4) {
                subject.masteredCards = (subject.masteredCards || 0) + 1;
              }
            }
          }
        });

        // Calculate completion percentages and accuracy
        subjectMap.forEach(subject => {
          if (subject.totalCards && subject.totalCards > 0) {
            subject.completionPercentage = Math.round(((subject.masteredCards || 0) / subject.totalCards) * 100);
            subject.averageAccuracy = subject.completionPercentage;
          } else if (subject.sessionCount > 0) {
            // Estimate completion based on session count
            subject.completionPercentage = Math.min(subject.sessionCount * 10, 100);
          }
        });

        const subjects = Array.from(subjectMap.values());
        console.log("✅ Processed subjects:", subjects.length);

        // Calculate summary statistics
        const totalStudyTimeMinutes = studySessions?.reduce((acc, session) => acc + (session.duration || 0), 0) || 0;
        const totalStudyTimeHours = totalStudyTimeMinutes / 3600;

        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const sessionsThisWeek = studySessions?.filter(s => new Date(s.start_time) >= weekAgo).length || 0;

        // Format time periods
        const formatTime = (minutes: number) => {
          if (minutes < 60) return `${Math.round(minutes)}m`;
          const hours = Math.floor(minutes / 60);
          const remainingMinutes = Math.round(minutes % 60);
          return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
        };

        const last7DaysMinutes = studySessions?.filter(s => 
          new Date(s.start_time) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        ).reduce((acc, s) => acc + (s.duration || 0), 0) || 0;

        const last30DaysMinutes = studySessions?.filter(s => 
          new Date(s.start_time) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        ).reduce((acc, s) => acc + (s.duration || 0), 0) || 0;

        const result = {
          subjects,
          totalStudyTime: totalStudyTimeHours,
          sessionsThisWeek,
          last7DaysFormatted: formatTime(last7DaysMinutes / 60),
          last30DaysFormatted: formatTime(last30DaysMinutes / 60),
          recommendations: getFallbackRecommendations(subjects)
        };

        console.log("🎉 Analytics result:", {
          subjectsCount: result.subjects.length,
          totalStudyTime: result.totalStudyTime,
          sessionsThisWeek: result.sessionsThisWeek
        });

        return result;

      } catch (error) {
        console.error("❌ Analytics query failed:", error);
        
        // Fallback to basic analytics
        console.log("🔄 Using fallback analytics method");
        const fallbackSubjects = await getFallbackSubjectAnalytics(user.id);
        
        return {
          subjects: fallbackSubjects.map(s => ({
            id: s.subject_id || s.subject_name,
            name: s.subject_name,
            completionPercentage: s.flashcard_accuracy || 0,
            totalStudyTimeMinutes: s.total_study_minutes || 0,
            sessionCount: s.study_sessions_count || 0,
            lastActivity: s.last_activity_date,
            averageAccuracy: s.flashcard_accuracy || 0,
            masteredCards: s.mastered_flashcards || 0,
            totalCards: s.total_flashcards || 0
          })),
          totalStudyTime: (fallbackSubjects.reduce((acc, s) => acc + (s.total_study_minutes || 0), 0) / 60),
          sessionsThisWeek: fallbackSubjects.reduce((acc, s) => acc + (s.study_sessions_count || 0), 0),
          last7DaysFormatted: "No data",
          last30DaysFormatted: "No data",
          recommendations: getFallbackRecommendations(fallbackSubjects)
        };
      }
    },
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error) => {
      console.log(`🔄 Retry attempt ${failureCount} for analytics:`, error);
      return failureCount < 2;
    }
  });

  return {
    subjectAnalytics: subjectAnalytics || {
      subjects: [],
      totalStudyTime: 0,
      sessionsThisWeek: 0,
      last7DaysFormatted: "No data",
      last30DaysFormatted: "No data",
      recommendations: []
    },
    isLoading,
    error
  };
};
