
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type StudySession = {
  id: string;
  user_id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  is_active: boolean;
  focus_time: number;
  break_time: number;
  subject: string | null;
  flashcard_set_id: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type StudySessionInput = Omit<
  StudySession,
  "id" | "user_id" | "created_at" | "updated_at" | "duration" | "is_active"
>;

export const useStudySessions = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState<StudySession | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [breakTime, setBreakTime] = useState(0);
  const [timerMode, setTimerMode] = useState<"focus" | "break">("focus");
  
  // Fetch all study sessions
  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ["studySessions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("start_time", { ascending: false });
      
      if (error) throw error;
      return data as StudySession[];
    },
    enabled: !!user
  });

  // Fetch active session if exists
  useEffect(() => {
    if (!user) return;
    
    const checkActiveSession = async () => {
      const { data, error } = await supabase
        .from("study_sessions")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("start_time", { ascending: false })
        .limit(1)
        .single();
      
      if (error && error.code !== "PGRST116") {
        console.error("Error checking for active session:", error);
        return;
      }
      
      if (data) {
        setActiveSession(data as StudySession);
        setTimerActive(true);
        // Set initial values from the existing session
        setFocusTime(data.focus_time);
        setBreakTime(data.break_time);
      }
    };
    
    checkActiveSession();
  }, [user]);

  // Create a new study session
  const startSession = useMutation({
    mutationFn: async (sessionData: Partial<StudySessionInput>) => {
      if (!user) throw new Error("User not authenticated");
      
      const newSession = {
        title: sessionData.title || "Study Session",
        start_time: new Date().toISOString(),
        subject: sessionData.subject || null,
        flashcard_set_id: sessionData.flashcard_set_id || null,
        notes: sessionData.notes || null,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from("study_sessions")
        .insert(newSession)
        .select()
        .single();
      
      if (error) throw error;
      return data as StudySession;
    },
    onSuccess: (data) => {
      setActiveSession(data);
      setTimerActive(true);
      setFocusTime(0);
      setBreakTime(0);
      queryClient.invalidateQueries({ queryKey: ["studySessions"] });
      toast.success("Study session started!");
    },
    onError: (error) => {
      toast.error("Failed to start session");
      console.error("Error starting session:", error);
    }
  });

  // Update session with accumulated times and end it
  const endSession = useMutation({
    mutationFn: async (notes?: string) => {
      if (!activeSession) throw new Error("No active session");
      
      const updatedSession = {
        end_time: new Date().toISOString(),
        focus_time: focusTime,
        break_time: breakTime,
        notes: notes || activeSession.notes
      };
      
      const { data, error } = await supabase
        .from("study_sessions")
        .update(updatedSession)
        .eq("id", activeSession.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      setActiveSession(null);
      setTimerActive(false);
      queryClient.invalidateQueries({ queryKey: ["studySessions"] });
      toast.success("Study session completed!");
    },
    onError: (error) => {
      toast.error("Failed to end session");
      console.error("Error ending session:", error);
    }
  });

  // Update existing session (for pause/resume, add notes, etc.)
  const updateSession = useMutation({
    mutationFn: async (updateData: Partial<StudySession>) => {
      if (!activeSession) throw new Error("No active session");
      
      const { data, error } = await supabase
        .from("study_sessions")
        .update({
          ...updateData,
          focus_time: focusTime,
          break_time: breakTime
        })
        .eq("id", activeSession.id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setActiveSession(data as StudySession);
      queryClient.invalidateQueries({ queryKey: ["studySessions"] });
    },
    onError: (error) => {
      toast.error("Failed to update session");
      console.error("Error updating session:", error);
    }
  });

  // Toggle between focus/break modes
  const toggleMode = () => {
    setTimerMode(prev => prev === "focus" ? "break" : "focus");
  };

  // Handle timer ticks (update focus or break time)
  const handleTimerTick = () => {
    if (!timerActive) return;
    
    if (timerMode === "focus") {
      setFocusTime(prev => prev + 1);
    } else {
      setBreakTime(prev => prev + 1);
    }
  };

  // Periodically save session data
  useEffect(() => {
    if (!activeSession || !timerActive) return;
    
    const saveInterval = setInterval(() => {
      updateSession.mutate({ 
        focus_time: focusTime,
        break_time: breakTime
      });
    }, 60000); // Save every minute
    
    return () => clearInterval(saveInterval);
  }, [activeSession, timerActive, focusTime, breakTime]);

  // Get statistics
  const getSessionStatistics = () => {
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        totalStudyTime: 0,
        averageSessionLength: 0
      };
    }
    
    const totalSessions = sessions.length;
    const totalStudyTime = sessions.reduce((acc, session) => 
      acc + (session.duration || 0), 0);
    const averageSessionLength = totalStudyTime / totalSessions;
    
    return {
      totalSessions,
      totalStudyTime,
      averageSessionLength
    };
  };

  return {
    sessions,
    activeSession,
    isLoading,
    error,
    startSession,
    endSession,
    updateSession,
    timerActive,
    timerMode,
    toggleMode,
    handleTimerTick,
    focusTime,
    breakTime,
    setTimerActive,
    getSessionStatistics
  };
};
