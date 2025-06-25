
import { StudyRecommendation, PerformancePrediction } from './types';

export function generateStudyRecommendations(
  overviewStats: any,
  gradeProgression: any[],
  studyTimeAnalytics: any,
  performancePrediction: PerformancePrediction,
  goals: any[]
): StudyRecommendation[] {
  const recommendations: StudyRecommendation[] = [];

  // Check if user needs to focus on weak subjects
  const weakSubjects = (gradeProgression || []).filter(subject => (subject.masteryLevel || 0) < 60);
  if (weakSubjects.length > 0 && weakSubjects[0].subject) {
    recommendations.push({
      type: 'focus_subject',
      subject: weakSubjects[0].subject,
      priority: 'high',
      message: `Focus on ${weakSubjects[0].subject} - currently at ${Math.round(weakSubjects[0].masteryLevel || 0)}% mastery`,
      estimatedImpact: '+15% mastery in 2 weeks'
    });
  }

  // Check for burnout risk
  if (performancePrediction.burnoutRisk === 'high') {
    recommendations.push({
      type: 'take_break',
      priority: 'high',
      message: 'Consider taking a short break to avoid burnout',
      estimatedImpact: 'Maintain long-term consistency'
    });
  }

  // Check weekly goal progress
  if (performancePrediction.weeklyGoalLikelihood < 50) {
    const weeklyHours = studyTimeAnalytics?.weeklyComparison?.thisWeek || 0;
    const targetHours = 5;
    const hoursNeeded = Math.max(0, targetHours - weeklyHours);
    recommendations.push({
      type: 'maintain_pace',
      priority: 'medium',
      message: 'Increase daily study time to meet weekly goals',
      estimatedImpact: `+${Math.ceil(hoursNeeded / 7 * 60)} min/day needed`
    });
  }

  // Difficulty adjustment recommendations
  if (performancePrediction.difficultyProgression === 'too_easy') {
    recommendations.push({
      type: 'increase_difficulty',
      priority: 'medium',
      message: 'Consider studying more challenging material',
      estimatedImpact: 'Accelerate learning progress'
    });
  }

  // Review weak areas recommendation
  const lowGradeSubjects = (gradeProgression || []).filter(s => 
    s.gradeDistribution?.find((g: any) => g.grade === 'C')?.percentage > 40
  );
  if (lowGradeSubjects.length > 0) {
    recommendations.push({
      type: 'review_weak_areas',
      priority: 'medium',
      message: 'Review cards with grade C to improve overall performance',
      estimatedImpact: '+10% accuracy improvement'
    });
  }

  return recommendations.slice(0, 4); // Limit to top 4 recommendations
}
