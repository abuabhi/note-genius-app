
import { StudySession, FlashcardProgress } from '../advanced/types';
import { 
  PerformanceForecast, 
  SubjectForecast, 
  ExamReadiness, 
  RiskArea, 
  ForecastAction 
} from './types';

export function generatePerformanceForecast(
  userSessions: StudySession[],
  gradeProgression: FlashcardProgress[]
): PerformanceForecast {
  const subjectForecasts = generateSubjectForecasts(userSessions, gradeProgression);
  const overallTrend = calculateOverallTrend(subjectForecasts);
  const examReadiness = calculateExamReadiness(subjectForecasts);
  const riskAreas = identifyRiskAreas(userSessions, gradeProgression);
  const recommendedActions = generateForecastActions(subjectForecasts, riskAreas);

  return {
    subjectForecasts,
    overallTrend,
    examReadiness,
    riskAreas,
    recommendedActions
  };
}

function generateSubjectForecasts(
  sessions: StudySession[],
  gradeProgression: FlashcardProgress[]
): SubjectForecast[] {
  // Group data by subject
  const subjectData = groupDataBySubject(sessions, gradeProgression);
  
  return Object.entries(subjectData).map(([subject, data]) => {
    const currentMastery = calculateCurrentMastery(data.gradeProgression);
    const projectedMastery = projectFutureMastery(data.sessions, currentMastery);
    const projectionDate = new Date();
    projectionDate.setDate(projectionDate.getDate() + 30); // 30-day projection

    return {
      subject,
      currentMastery,
      projectedMastery,
      projectionDate: projectionDate.toISOString(),
      confidenceInterval: {
        lower: Math.max(0, projectedMastery - 15),
        upper: Math.min(100, projectedMastery + 15)
      },
      factors: identifyInfluencingFactors(data.sessions)
    };
  });
}

function groupDataBySubject(
  sessions: StudySession[],
  gradeProgression: FlashcardProgress[]
) {
  const subjectData: Record<string, { 
    sessions: StudySession[]; 
    gradeProgression: FlashcardProgress[] 
  }> = {};

  // Group sessions by flashcard_set_id since StudySession doesn't have subject directly
  sessions.forEach(session => {
    const sessionKey = session.flashcard_set_id ? `set_${session.flashcard_set_id}` : 'General';
    if (!subjectData[sessionKey]) {
      subjectData[sessionKey] = { sessions: [], gradeProgression: [] };
    }
    subjectData[sessionKey].sessions.push(session);
  });

  // Group grade progression by subject
  gradeProgression.forEach(progress => {
    const subject = progress.flashcard?.flashcard_set_cards?.[0]?.flashcard_sets?.subject || 'General';
    if (!subjectData[subject]) {
      subjectData[subject] = { sessions: [], gradeProgression: [] };
    }
    subjectData[subject].gradeProgression.push(progress);
  });

  return subjectData;
}

function calculateCurrentMastery(gradeProgression: FlashcardProgress[]): number {
  if (gradeProgression.length === 0) return 0;
  
  return gradeProgression.reduce((sum, progress) => 
    sum + (progress.mastery_level || 0), 0
  ) / gradeProgression.length;
}

function projectFutureMastery(sessions: StudySession[], currentMastery: number): number {
  if (sessions.length < 3) {
    // Not enough data, assume slow improvement
    return Math.min(100, currentMastery + 10);
  }

  // Calculate recent trend
  const recentSessions = sessions
    .sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
    .slice(0, 5);

  const avgAccuracy = recentSessions
    .filter(s => s.cards_reviewed && s.cards_reviewed > 0)
    .reduce((sum, s) => sum + ((s.cards_correct || 0) / (s.cards_reviewed || 1)), 0) / recentSessions.length;

  // Project based on current trajectory
  const improvementRate = avgAccuracy > 0.8 ? 20 : avgAccuracy > 0.6 ? 15 : 10;
  
  return Math.min(100, currentMastery + improvementRate);
}

function identifyInfluencingFactors(sessions: StudySession[]): string[] {
  const factors: string[] = [];
  
  if (sessions.length === 0) return ['Insufficient data'];

  const avgDuration = sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length;
  const totalSessions = sessions.length;
  const recentSessions = sessions.filter(s => 
    new Date(s.start_time) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  ).length;

  if (avgDuration > 3600) factors.push('Long study sessions');
  if (avgDuration < 1200) factors.push('Short study sessions');
  if (totalSessions > 20) factors.push('High study frequency');
  if (recentSessions === 0) factors.push('No recent activity');
  if (recentSessions > 5) factors.push('High recent activity');

  return factors.length > 0 ? factors : ['Regular study pattern'];
}

function calculateOverallTrend(subjectForecasts: SubjectForecast[]): 'improving' | 'stable' | 'declining' {
  if (subjectForecasts.length === 0) return 'stable';

  const improvements = subjectForecasts.filter(f => f.projectedMastery > f.currentMastery);
  const declines = subjectForecasts.filter(f => f.projectedMastery < f.currentMastery);

  if (improvements.length > declines.length * 2) return 'improving';
  if (declines.length > improvements.length * 2) return 'declining';
  return 'stable';
}

function calculateExamReadiness(subjectForecasts: SubjectForecast[]): ExamReadiness[] {
  return subjectForecasts.map(forecast => {
    const readinessScore = Math.min(100, forecast.projectedMastery);
    const recommendedStudyHours = Math.max(0, Math.ceil((80 - readinessScore) / 2));
    
    return {
      subject: forecast.subject,
      readinessScore,
      recommendedStudyHours,
      criticalTopics: readinessScore < 60 ? ['Foundation concepts', 'Core principles'] : [],
      strengthAreas: readinessScore > 80 ? ['Advanced applications', 'Complex problems'] : []
    };
  });
}

function identifyRiskAreas(
  sessions: StudySession[],
  gradeProgression: FlashcardProgress[]
): RiskArea[] {
  const risks: RiskArea[] = [];

  // Check for inconsistent study patterns
  const recentSessions = sessions.filter(s => 
    new Date(s.start_time) > new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  );

  if (recentSessions.length < 3) {
    risks.push({
      area: 'Study Consistency',
      riskLevel: 'high',
      description: 'Irregular study schedule detected',
      impact: 'May lead to knowledge retention issues',
      mitigation: ['Set daily study reminders', 'Create a study schedule', 'Start with shorter sessions']
    });
  }

  // Check for subjects with declining performance
  const subjectPerformance = groupDataBySubject(sessions, gradeProgression);
  Object.entries(subjectPerformance).forEach(([subject, data]) => {
    const currentMastery = calculateCurrentMastery(data.gradeProgression);
    if (currentMastery < 40) {
      risks.push({
        area: `${subject} Performance`,
        riskLevel: 'medium',
        description: `Low mastery level in ${subject}`,
        impact: 'May affect overall academic performance',
        mitigation: ['Focus more time on this subject', 'Review fundamentals', 'Seek additional resources']
      });
    }
  });

  return risks;
}

function generateForecastActions(
  subjectForecasts: SubjectForecast[],
  riskAreas: RiskArea[]
): ForecastAction[] {
  const actions: ForecastAction[] = [];

  // Actions based on subject forecasts
  subjectForecasts.forEach(forecast => {
    if (forecast.projectedMastery < 60) {
      actions.push({
        priority: 'high',
        action: `Increase study time for ${forecast.subject}`,
        expectedImpact: 'Improve mastery by 15-20 points',
        timeframe: '2-3 weeks',
        category: 'content_focus'
      });
    }
  });

  // Actions based on risk areas
  riskAreas.forEach(risk => {
    if (risk.riskLevel === 'high') {
      actions.push({
        priority: 'critical',
        action: risk.mitigation[0] || 'Address identified risk',
        expectedImpact: 'Prevent performance decline',
        timeframe: '1 week',
        category: 'study_schedule'
      });
    }
  });

  // General optimization actions
  if (actions.length === 0) {
    actions.push({
      priority: 'medium',
      action: 'Maintain current study routine with minor optimizations',
      expectedImpact: 'Steady progress across all subjects',
      timeframe: 'Ongoing',
      category: 'technique'
    });
  }

  return actions;
}
