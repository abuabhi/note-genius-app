
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightRequest {
  userId: string;
  analysisType: 'predictive' | 'behavioral' | 'performance' | 'comprehensive';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { userId, analysisType }: InsightRequest = await req.json();

    console.log('Generating learning insights:', { userId, analysisType });

    // Get comprehensive user data
    const [sessionsData, progressData, goalsData, patternsData] = await Promise.all([
      supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: false })
        .limit(100),
      
      supabase
        .from('user_flashcard_progress')
        .select('*, flashcards!inner(flashcard_sets!inner(subject, name))')
        .eq('user_id', userId),
      
      supabase
        .from('study_goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active'),
      
      supabase
        .from('learning_patterns')
        .select('*')
        .eq('user_id', userId)
        .order('strength_score', { ascending: false })
    ]);

    const sessions = sessionsData.data || [];
    const progress = progressData.data || [];
    const goals = goalsData.data || [];
    const patterns = patternsData.data || [];

    // Prepare data summary for AI analysis
    const dataSummary = {
      totalSessions: sessions.length,
      totalStudyTime: sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600, // hours
      averageAccuracy: sessions.length > 0 
        ? sessions.reduce((acc, s) => acc + ((s.cards_correct || 0) / Math.max(s.cards_reviewed || 1, 1)), 0) / sessions.length
        : 0,
      subjectsStudied: [...new Set(progress.map(p => p.flashcards?.flashcard_sets?.subject).filter(Boolean))],
      masteredCards: progress.filter(p => p.mastery_level >= 4).length,
      activeGoals: goals.length,
      detectedPatterns: patterns.length,
      weeklyGoalProgress: goals.length > 0 ? (goals[0].progress || 0) / goals[0].target_hours * 100 : 0,
      consistencyScore: calculateConsistencyScore(sessions),
      learningVelocity: calculateLearningVelocity(sessions, progress)
    };

    // Generate AI-powered insights
    const insightsPrompt = `
Analyze this student's learning data and provide actionable insights:

Data Summary:
- Total Sessions: ${dataSummary.totalSessions}
- Total Study Time: ${dataSummary.totalStudyTime.toFixed(1)} hours
- Average Accuracy: ${Math.round(dataSummary.averageAccuracy * 100)}%
- Subjects: ${dataSummary.subjectsStudied.join(', ')}
- Mastered Cards: ${dataSummary.masteredCards}
- Active Goals: ${dataSummary.activeGoals}
- Weekly Goal Progress: ${dataSummary.weeklyGoalProgress.toFixed(1)}%
- Consistency Score: ${dataSummary.consistencyScore.toFixed(2)}
- Learning Velocity: ${dataSummary.learningVelocity.toFixed(1)} cards/hour

Please provide a JSON response with personalized insights in this format:
{
  "insights": [
    {
      "type": "prediction|recommendation|warning|achievement",
      "title": "Brief insight title",
      "description": "Detailed explanation with specific advice",
      "confidence": 0.0-1.0,
      "priority": "low|medium|high",
      "actionable": true|false,
      "category": "performance|efficiency|consistency|goals"
    }
  ],
  "predictions": {
    "weeklyGoalLikelihood": 0.0-1.0,
    "retentionForecast": "improving|stable|declining",
    "recommendedStudyAdjustments": ["adjustment1", "adjustment2"]
  },
  "keyRecommendations": [
    "Primary recommendation based on data",
    "Secondary optimization suggestion"
  ]
}

Focus on:
1. Specific, actionable advice based on actual performance data
2. Realistic predictions with confidence levels
3. Personalized recommendations for improvement
4. Recognition of achievements and positive patterns
5. Early warning signs that need attention
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert learning analytics AI that provides personalized insights based on student performance data. Focus on actionable, evidence-based recommendations.'
          },
          { role: 'user', content: insightsPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const aiResponse = await response.json();
    console.log('AI Insights Response:', aiResponse);

    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid JSON response from AI analysis');
    }

    // Store insights in database
    const insightInserts = analysisResult.insights.map(insight => ({
      user_id: userId,
      insight_type: insight.type,
      insight_data: {
        title: insight.title,
        description: insight.description,
        actionable: insight.actionable,
        priority: insight.priority,
        category: insight.category
      },
      confidence_score: insight.confidence,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
    }));

    if (insightInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('learning_insights')
        .insert(insightInserts);

      if (insertError) {
        console.error('Error storing insights:', insertError);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      insights: analysisResult.insights,
      predictions: analysisResult.predictions,
      recommendations: analysisResult.keyRecommendations,
      dataAnalyzed: dataSummary
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-learning-insights function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

function calculateConsistencyScore(sessions: any[]): number {
  if (sessions.length === 0) return 0;
  
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  });

  const studyDays = new Set(sessions
    .filter(s => new Date(s.start_time) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
    .map(s => s.start_time.split('T')[0])
  );

  return studyDays.size / 30;
}

function calculateLearningVelocity(sessions: any[], progress: any[]): number {
  const totalStudyTime = sessions.reduce((acc, s) => acc + (s.duration || 0), 0) / 3600; // hours
  const masteredCards = progress.filter(p => p.mastery_level >= 4).length;
  return totalStudyTime > 0 ? masteredCards / totalStudyTime : 0;
}
