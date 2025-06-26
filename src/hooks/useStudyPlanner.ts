
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import { StudyPlan, StudyPlanSession, StudyPlanFormData } from '@/types/studyPlanner';
import { toast } from 'sonner';

export const useStudyPlanner = () => {
  const { user } = useRequireAuth();
  const queryClient = useQueryClient();

  // Fetch study plans
  const { data: studyPlans, isLoading: plansLoading } = useQuery({
    queryKey: ['study-plans', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('study_plans')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as StudyPlan[];
    },
    enabled: !!user?.id,
  });

  // Create study plan mutation
  const createPlanMutation = useMutation({
    mutationFn: async (planData: StudyPlanFormData) => {
      if (!user?.id) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('study_plans')
        .insert({
          ...planData,
          user_id: user.id,
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      toast.success('Study plan created successfully!');
    },
    onError: (error) => {
      toast.error('Failed to create study plan: ' + error.message);
    },
  });

  // Generate sessions for a plan
  const generateSessionsMutation = useMutation({
    mutationFn: async (planId: string) => {
      // This will be enhanced in Phase 2 with AI
      // For now, basic session generation
      const plan = studyPlans?.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');
      
      const sessions = generateBasicSessions(plan);
      
      const { data, error } = await supabase
        .from('study_plan_sessions')
        .insert(sessions);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plan-sessions'] });
      toast.success('Study sessions generated successfully!');
    },
  });

  // Convert plan to goals
  const convertToGoalsMutation = useMutation({
    mutationFn: async (planId: string) => {
      const plan = studyPlans?.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');
      
      // Create goals for each topic
      const goals = plan.topics.map(topic => ({
        user_id: user?.id,
        title: `${plan.subject}: ${topic.name}`,
        description: `Study goal for ${topic.name} (${topic.estimated_hours} hours)`,
        target_hours: topic.estimated_hours,
        start_date: plan.start_date,
        end_date: plan.end_date,
        academic_subject: plan.subject,
        status: 'active',
      }));
      
      const { error: goalsError } = await supabase
        .from('study_goals')
        .insert(goals);
      
      if (goalsError) throw goalsError;
      
      // Mark plan as converted
      const { error: updateError } = await supabase
        .from('study_plans')
        .update({ is_converted_to_goals: true })
        .eq('id', planId);
      
      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['study-plans'] });
      queryClient.invalidateQueries({ queryKey: ['study-goals'] });
      toast.success('Study plan converted to goals successfully!');
    },
  });

  return {
    studyPlans,
    plansLoading,
    createPlan: createPlanMutation.mutateAsync,
    generateSessions: generateSessionsMutation.mutateAsync,
    convertToGoals: convertToGoalsMutation.mutateAsync,
    isCreating: createPlanMutation.isPending,
    isGenerating: generateSessionsMutation.isPending,
    isConverting: convertToGoalsMutation.isPending,
  };
};

// Basic session generation logic (will be enhanced in Phase 2)
function generateBasicSessions(plan: StudyPlan): Partial<StudyPlanSession>[] {
  const sessions: Partial<StudyPlanSession>[] = [];
  const startDate = new Date(plan.start_date);
  const endDate = new Date(plan.end_date);
  
  // Simple algorithm: distribute topics across available days
  let currentDate = new Date(startDate);
  let topicIndex = 0;
  
  while (currentDate <= endDate && topicIndex < plan.topics.length) {
    const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'lowercase' });
    
    if (plan.available_days.includes(dayName)) {
      const topic = plan.topics[topicIndex];
      const timeSlot = plan.available_times[dayName];
      
      if (timeSlot) {
        sessions.push({
          study_plan_id: plan.id,
          title: `Study: ${topic.name}`,
          topic: topic.name,
          scheduled_date: currentDate.toISOString().split('T')[0],
          scheduled_start_time: timeSlot.start,
          scheduled_end_time: addMinutes(timeSlot.start, plan.preferred_session_duration),
          duration_minutes: plan.preferred_session_duration,
          session_type: 'study',
          priority: topic.priority,
          status: 'scheduled',
        });
      }
      
      // Move to next topic after creating a session
      if (sessions.length % 2 === 0) {
        topicIndex++;
      }
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return sessions;
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
}
