
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth';

interface PerformancePrediction {
  flashcardId: string;
  retentionProbability: number;
  masteryTimeline: number; // days to mastery
  difficultyReadiness: number; // 1-5 scale
  optimalReviewTime: Date;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
}

interface SubjectPrediction {
  subject: string;
  overallMastery: number;
  timeToTarget: number; // days to reach target mastery
  weakestAreas: string[];
  strongestAreas: string[];
  recommendedFocus: string[];
}

interface LearningTrajectory {
  currentVelocity: number;
  accelerationTrend: number;
  plateauRisk: number;
  burnoutRisk: number;
  optimalStudyDuration: number;
}

export const usePerformancePrediction = () => {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<Map<string, PerformancePrediction>>(new Map());
  const [subjectPredictions, setSubjectPredictions] = useState<SubjectPrediction[]>([]);
  const [learningTrajectory, setLearningTrajectory] = useState<LearningTrajectory | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Advanced forgetting curve with individual parameters
  const calculateRetentionProbability = useCallback((
    daysSinceReview: number,
    easeFactor: number,
    difficulty: number,
    historicalRetention: number[]
  ): number => {
    // Base forgetting curve: R(t) = e^(-t/S)
    // Where S is stability influenced by ease factor and difficulty
    const stability = easeFactor * (6 - difficulty) * 2;
    
    // Personal retention adjustment based on historical data
    const personalRetentionFactor = historicalRetention.length > 0
      ? historicalRetention.reduce((sum, rate) => sum + rate, 0) / historicalRetention.length
      : 0.7;

    // Calculate base retention probability
    const baseRetention = Math.exp(-daysSinceReview / stability);
    
    // Apply personal adjustment
    const adjustedRetention = baseRetention * (0.5 + personalRetentionFactor * 0.5);
    
    return Math.max(0.01, Math.min(0.99, adjustedRetention));
  }, []);

  // Predict mastery timeline using learning velocity
  const predictMasteryTimeline = useCallback((
    currentConfidence: number,
    learningVelocity: number,
    difficulty: number,
    sessionFrequency: number
  ): number => {
    const targetConfidence = 0.9; // 90% mastery threshold
    const confidenceGap = targetConfidence - currentConfidence;
    
    // Adjust velocity based on difficulty
    const difficultyMultiplier = Math.pow(difficulty / 3, 0.8);
    const adjustedVelocity = learningVelocity / difficultyMultiplier;
    
    // Account for spacing effect
    const spacingMultiplier = sessionFrequency > 1 ? Math.log(sessionFrequency) : 1;
    
    // Predict days to mastery
    const daysToMastery = confidenceGap / (adjustedVelocity * spacingMultiplier);
    
    return Math.max(1, Math.min(365, daysToMastery)); // Cap between 1 day and 1 year
  }, []);

  // Generate predictions for a single flashcard
  const generateFlashcardPrediction = useCallback(async (flashcardId: string): Promise<PerformancePrediction | null> => {
    if (!user) return null;

    try {
      // Get comprehensive flashcard data
      const { data: progressData } = await supabase
        .from('user_flashcard_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .single();

      const { data: learningData } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('flashcard_id', flashcardId)
        .single();

      const { data: flashcardData } = await supabase
        .from('flashcards')
        .select('difficulty')
        .eq('id', flashcardId)
        .single();

      if (!progressData || !learningData || !flashcardData) return null;

      // Calculate days since last review
      const daysSinceReview = progressData.last_reviewed_at
        ? Math.max(0, (Date.now() - new Date(progressData.last_reviewed_at).getTime()) / (1000 * 60 * 60 * 24))
        : 999;

      // Historical retention rates (simplified - could be expanded)
      const historicalRetention = [learningData.times_correct / Math.max(1, learningData.times_seen)];

      // Calculate retention probability
      const retentionProbability = calculateRetentionProbability(
        daysSinceReview,
        progressData.ease_factor || 2.5,
        flashcardData.difficulty || 3,
        historicalRetention
      );

      // Current confidence based on performance
      const currentConfidence = Math.min(0.95, (learningData.confidence_level / 5) * retentionProbability);

      // Learning velocity based on recent progress
      const learningVelocity = learningData.times_seen > 5 
        ? (learningData.times_correct / learningData.times_seen) * 0.1
        : 0.05;

      // Predict mastery timeline
      const masteryTimeline = predictMasteryTimeline(
        currentConfidence,
        learningVelocity,
        flashcardData.difficulty,
        1 // Daily frequency assumption
      );

      // Difficulty readiness (can handle harder content)
      const difficultyReadiness = Math.min(5, Math.max(1, 
        (retentionProbability * 3) + (currentConfidence * 2)
      ));

      // Optimal review time based on forgetting curve
      const optimalReviewTime = new Date();
      const optimalDays = Math.max(1, -Math.log(0.8) * (progressData.ease_factor || 2.5) * (6 - flashcardData.difficulty));
      optimalReviewTime.setDate(optimalReviewTime.getDate() + Math.round(optimalDays));

      // Confidence intervals (Monte Carlo simulation would be more accurate)
      const uncertainty = 0.1 + (0.2 / Math.max(1, learningData.times_seen));
      
      return {
        flashcardId,
        retentionProbability,
        masteryTimeline,
        difficultyReadiness,
        optimalReviewTime,
        confidenceInterval: {
          lower: Math.max(0, retentionProbability - uncertainty),
          upper: Math.min(1, retentionProbability + uncertainty)
        }
      };

    } catch (error) {
      console.error('Error generating flashcard prediction:', error);
      return null;
    }
  }, [user, calculateRetentionProbability, predictMasteryTimeline]);

  // Generate subject-level predictions
  const generateSubjectPredictions = useCallback(async (): Promise<SubjectPrediction[]> => {
    if (!user) return [];

    try {
      // Get all flashcard sets and their subjects
      const { data: flashcardSets } = await supabase
        .from('flashcard_sets')
        .select('id, subject, name')
        .eq('user_id', user.id);

      if (!flashcardSets) return [];

      const subjectMap = new Map<string, SubjectPrediction>();

      for (const set of flashcardSets) {
        const subject = set.subject || 'General';
        
        if (!subjectMap.has(subject)) {
          subjectMap.set(subject, {
            subject,
            overallMastery: 0,
            timeToTarget: 0,
            weakestAreas: [],
            strongestAreas: [],
            recommendedFocus: []
          });
        }

        // Get flashcards in this set
        const { data: flashcards } = await supabase
          .from('flashcard_set_cards')
          .select('flashcard_id')
          .eq('set_id', set.id);

        if (!flashcards) continue;

        // Generate predictions for each flashcard
        let subjectMastery = 0;
        let totalTimeToMastery = 0;
        let cardCount = 0;

        for (const card of flashcards) {
          const prediction = await generateFlashcardPrediction(card.flashcard_id);
          if (prediction) {
            subjectMastery += prediction.retentionProbability;
            totalTimeToMastery += prediction.masteryTimeline;
            cardCount++;
          }
        }

        if (cardCount > 0) {
          const subjectPrediction = subjectMap.get(subject)!;
          subjectPrediction.overallMastery = subjectMastery / cardCount;
          subjectPrediction.timeToTarget = totalTimeToMastery / cardCount;
          
          // Determine weak/strong areas based on set performance
          if (subjectPrediction.overallMastery < 0.6) {
            subjectPrediction.weakestAreas.push(set.name);
            subjectPrediction.recommendedFocus.push(set.name);
          } else if (subjectPrediction.overallMastery > 0.8) {
            subjectPrediction.strongestAreas.push(set.name);
          }
        }
      }

      return Array.from(subjectMap.values());

    } catch (error) {
      console.error('Error generating subject predictions:', error);
      return [];
    }
  }, [user, generateFlashcardPrediction]);

  // Calculate learning trajectory metrics
  const calculateLearningTrajectory = useCallback(async (): Promise<LearningTrajectory | null> => {
    if (!user) return null;

    try {
      // Get recent study sessions
      const { data: recentSessions } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user.id)
        .order('start_time', { ascending: false })
        .limit(20);

      if (!recentSessions || recentSessions.length < 5) return null;

      // Calculate learning velocity (improvement over time)
      const sessions = recentSessions.reverse(); // Chronological order
      const velocities = [];
      
      for (let i = 1; i < sessions.length; i++) {
        const prev = sessions[i - 1];
        const curr = sessions[i];
        
        const prevAccuracy = prev.cards_reviewed > 0 ? prev.cards_correct / prev.cards_reviewed : 0;
        const currAccuracy = curr.cards_reviewed > 0 ? curr.cards_correct / curr.cards_reviewed : 0;
        
        velocities.push(currAccuracy - prevAccuracy);
      }

      const currentVelocity = velocities.length > 0
        ? velocities.reduce((sum, v) => sum + v, 0) / velocities.length
        : 0;

      // Calculate acceleration (change in velocity)
      const accelerationTrend = velocities.length > 3
        ? (velocities.slice(-3).reduce((sum, v) => sum + v, 0) / 3) - 
          (velocities.slice(0, 3).reduce((sum, v) => sum + v, 0) / 3)
        : 0;

      // Plateau risk (velocity approaching zero)
      const plateauRisk = Math.max(0, 1 - Math.abs(currentVelocity) * 10);

      // Burnout risk based on session frequency and duration
      const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
      const sessionFrequency = sessions.length / 7; // Sessions per week
      
      const burnoutRisk = Math.min(1, (avgDuration / 7200) * (sessionFrequency / 7) * 0.5);

      // Optimal study duration based on performance patterns
      const performanceByDuration = sessions.map(s => ({
        duration: s.duration || 0,
        accuracy: s.cards_reviewed > 0 ? s.cards_correct / s.cards_reviewed : 0
      }));

      const optimalStudyDuration = performanceByDuration.length > 0
        ? performanceByDuration
            .sort((a, b) => b.accuracy - a.accuracy)
            .slice(0, 3)
            .reduce((sum, p) => sum + p.duration, 0) / 3
        : 2700; // Default 45 minutes

      return {
        currentVelocity,
        accelerationTrend,
        plateauRisk,
        burnoutRisk,
        optimalStudyDuration: Math.round(optimalStudyDuration / 60) // Convert to minutes
      };

    } catch (error) {
      console.error('Error calculating learning trajectory:', error);
      return null;
    }
  }, [user]);

  // Main function to generate all predictions
  const generateAllPredictions = useCallback(async () => {
    if (!user) return;

    setIsCalculating(true);
    try {
      // Generate subject predictions
      const subjectPreds = await generateSubjectPredictions();
      setSubjectPredictions(subjectPreds);

      // Calculate learning trajectory
      const trajectory = await calculateLearningTrajectory();
      setLearningTrajectory(trajectory);

      console.log('Generated performance predictions for', subjectPreds.length, 'subjects');

    } catch (error) {
      console.error('Error generating all predictions:', error);
    } finally {
      setIsCalculating(false);
    }
  }, [user, generateSubjectPredictions, calculateLearningTrajectory]);

  // Auto-generate predictions when user changes
  useEffect(() => {
    if (user) {
      generateAllPredictions();
    }
  }, [user, generateAllPredictions]);

  return {
    predictions,
    subjectPredictions,
    learningTrajectory,
    isCalculating,
    generateFlashcardPrediction,
    generateSubjectPredictions,
    calculateLearningTrajectory,
    generateAllPredictions
  };
};
