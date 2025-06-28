
import { supabase } from "@/integrations/supabase/client";

// Fallback function when database functions are not available
export const getFallbackSubjectAnalytics = async (userId: string) => {
  console.log('📊 Using fallback subject analytics method');
  
  try {
    // Get user subjects as the base
    const { data: userSubjects } = await supabase
      .from('user_subjects')
      .select('*')
      .eq('user_id', userId);

    // Get flashcard data
    const { data: flashcardSets } = await supabase
      .from('flashcard_sets')
      .select(`
        *,
        flashcards!inner(
          id,
          user_flashcard_progress(mastery_level, grade)
        )
      `)
      .eq('user_id', userId);

    // Get study sessions
    const { data: studySessions } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('start_time', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    // Get notes
    const { data: notes } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    // Process the data to create unified analytics
    const subjectMap = new Map();

    // Initialize with user subjects
    userSubjects?.forEach(subject => {
      subjectMap.set(subject.name, {
        subject_name: subject.name,
        subject_id: subject.id,
        flashcard_sets_count: 0,
        total_flashcards: 0,
        mastered_flashcards: 0,
        flashcard_accuracy: 0,
        quiz_attempts: 0,
        quiz_avg_score: 0,
        study_sessions_count: 0,
        total_study_minutes: 0,
        notes_count: 0,
        last_activity_date: null,
        learning_velocity: 0
      });
    });

    // Add flashcard data
    flashcardSets?.forEach(set => {
      if (!set.subject) return;
      
      const subject = subjectMap.get(set.subject) || {
        subject_name: set.subject,
        subject_id: null,
        flashcard_sets_count: 0,
        total_flashcards: 0,
        mastered_flashcards: 0,
        flashcard_accuracy: 0,
        quiz_attempts: 0,
        quiz_avg_score: 0,
        study_sessions_count: 0,
        total_study_minutes: 0,
        notes_count: 0,
        last_activity_date: null,
        learning_velocity: 0
      };

      subject.flashcard_sets_count += 1;
      subject.total_flashcards += set.flashcards?.length || 0;
      
      const masteredCards = set.flashcards?.filter(card => 
        card.user_flashcard_progress?.[0]?.mastery_level >= 4
      ).length || 0;
      
      subject.mastered_flashcards += masteredCards;
      
      subjectMap.set(set.subject, subject);
    });

    // Add study session data
    studySessions?.forEach(session => {
      if (!session.subject) return;
      
      const subject = subjectMap.get(session.subject);
      if (subject) {
        subject.study_sessions_count += 1;
        subject.total_study_minutes += Math.floor((session.duration || 0) / 60);
        
        const sessionDate = new Date(session.start_time).toISOString().split('T')[0];
        if (!subject.last_activity_date || sessionDate > subject.last_activity_date) {
          subject.last_activity_date = sessionDate;
        }
      }
    });

    // Add notes data
    notes?.forEach(note => {
      const userSubject = userSubjects?.find(us => us.id === note.subject_id);
      if (userSubject) {
        const subject = subjectMap.get(userSubject.name);
        if (subject) {
          subject.notes_count += 1;
        }
      }
    });

    // Calculate learning velocity and accuracy
    subjectMap.forEach(subject => {
      if (subject.total_flashcards > 0) {
        subject.flashcard_accuracy = Math.round((subject.mastered_flashcards / subject.total_flashcards) * 100);
      }
      
      if (subject.total_study_minutes > 0) {
        subject.learning_velocity = Number((subject.mastered_flashcards / (subject.total_study_minutes / 60)).toFixed(2));
      }
    });

    return Array.from(subjectMap.values()).filter(subject => 
      subject.flashcard_sets_count > 0 || subject.study_sessions_count > 0 || subject.notes_count > 0
    );

  } catch (error) {
    console.error('❌ Fallback subject analytics failed:', error);
    return [];
  }
};

export const getFallbackRecommendations = (subjects: any[]) => {
  return subjects.map(subject => {
    if (subject.flashcard_accuracy < 60 && subject.total_flashcards > 5) {
      return {
        subject_name: subject.subject_name,
        recommendation_type: 'review_flashcards',
        priority: subject.flashcard_accuracy < 40 ? 'high' : 'medium',
        message: `Flashcard accuracy is ${subject.flashcard_accuracy}%. Review fundamental concepts.`,
        action_items: ['Review difficult flashcards', 'Create new study notes', 'Practice spaced repetition']
      };
    }
    
    if (!subject.last_activity_date || new Date(subject.last_activity_date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) {
      return {
        subject_name: subject.subject_name,
        recommendation_type: 'resume_study',
        priority: 'medium',
        message: 'No recent activity. Resume studying to maintain momentum.',
        action_items: ['Start with quick review session', 'Review recent notes', 'Take a short quiz to refresh']
      };
    }
    
    return {
      subject_name: subject.subject_name,
      recommendation_type: 'maintain_progress',
      priority: 'low',
      message: 'Good progress! Keep up the consistent study pattern.',
      action_items: ['Continue current study plan', 'Maintain regular sessions']
    };
  }).filter(Boolean);
};
