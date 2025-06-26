
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

interface ContentAnalysisRequest {
  content: string;
  contentType: 'note' | 'flashcard' | 'quiz';
  subject?: string;
  userId: string;
}

interface TopicDetection {
  topic: string;
  confidence: number;
  difficulty_level: number;
  learning_objectives: string[];
  related_concepts: string[];
}

interface ContentAnalysisResponse {
  detected_topics: TopicDetection[];
  content_quality_score: number;
  suggested_improvements: string[];
  recommended_next_topics: string[];
  learning_style_insights: {
    visual_elements: number;
    conceptual_depth: number;
    practical_examples: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { content, contentType, subject, userId }: ContentAnalysisRequest = await req.json();

    console.log('Analyzing content:', { contentType, subject, contentLength: content.length });

    // Get user's learning preferences
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('adaptive_learning_preferences')
      .eq('id', userId)
      .single();

    const learningPrefs = userProfile?.adaptive_learning_preferences || {};

    // AI-powered content analysis
    const analysisPrompt = `
Analyze the following ${contentType} content and provide detailed insights:

Content: "${content}"
Subject: ${subject || 'General'}
Content Type: ${contentType}

Please provide a JSON response with the following structure:
{
  "detected_topics": [
    {
      "topic": "specific topic name",
      "confidence": 0.0-1.0,
      "difficulty_level": 1-10,
      "learning_objectives": ["objective1", "objective2"],
      "related_concepts": ["concept1", "concept2"]
    }
  ],
  "content_quality_score": 0.0-1.0,
  "suggested_improvements": ["improvement1", "improvement2"],
  "recommended_next_topics": ["topic1", "topic2"],
  "learning_style_insights": {
    "visual_elements": 0.0-1.0,
    "conceptual_depth": 0.0-1.0,
    "practical_examples": 0.0-1.0
  }
}

Focus on:
1. Accurate topic detection with high confidence scores
2. Appropriate difficulty assessment
3. Clear learning objectives
4. Meaningful topic relationships
5. Quality assessment based on clarity, completeness, and educational value
6. Actionable improvement suggestions
7. Logical next learning steps
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
            content: 'You are an expert educational content analyzer. Provide accurate, detailed analysis of learning materials with focus on topic detection, quality assessment, and learning path optimization.'
          },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.3,
      }),
    });

    const aiResponse = await response.json();
    console.log('OpenAI Analysis Response:', aiResponse);

    if (!aiResponse.choices?.[0]?.message?.content) {
      throw new Error('Invalid response from OpenAI');
    }

    let analysisResult: ContentAnalysisResponse;
    try {
      analysisResult = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      throw new Error('Invalid JSON response from AI analysis');
    }

    // Store analysis results for caching and learning
    const { error: storeError } = await supabase
      .from('content_analysis_cache')
      .upsert({
        user_id: userId,
        content_hash: await hashContent(content),
        content_type: contentType,
        subject: subject || null,
        analysis_result: analysisResult,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      });

    if (storeError) {
      console.error('Error storing analysis result:', storeError);
    }

    // Update user's learning profile based on analysis
    await updateLearningProfile(supabase, userId, analysisResult, learningPrefs);

    return new Response(JSON.stringify(analysisResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-content function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      detected_topics: [],
      content_quality_score: 0,
      suggested_improvements: [],
      recommended_next_topics: [],
      learning_style_insights: {
        visual_elements: 0,
        conceptual_depth: 0,
        practical_examples: 0
      }
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function hashContent(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function updateLearningProfile(supabase: any, userId: string, analysis: ContentAnalysisResponse, currentPrefs: any) {
  try {
    const updatedPrefs = {
      ...currentPrefs,
      learning_patterns: {
        ...currentPrefs.learning_patterns,
        preferred_visual_content: Math.max(
          currentPrefs.learning_patterns?.preferred_visual_content || 0,
          analysis.learning_style_insights.visual_elements
        ),
        conceptual_depth_preference: Math.max(
          currentPrefs.learning_patterns?.conceptual_depth_preference || 0,
          analysis.learning_style_insights.conceptual_depth
        ),
        practical_example_preference: Math.max(
          currentPrefs.learning_patterns?.practical_example_preference || 0,
          analysis.learning_style_insights.practical_examples
        )
      },
      last_analysis_update: new Date().toISOString()
    };

    await supabase
      .from('profiles')
      .update({ adaptive_learning_preferences: updatedPrefs })
      .eq('id', userId);

  } catch (error) {
    console.error('Error updating learning profile:', error);
  }
}
