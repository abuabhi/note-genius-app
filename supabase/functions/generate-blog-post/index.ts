import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const openAIApiKey = Deno.env.get('OPENAI_API_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GenerationRequest {
  queueId: string;
  topic: string;
  contentType: string;
  keywords: string[];
  categoryId?: string;
  customPrompt?: string;
}

const CONTENT_TEMPLATES = {
  'study-tips': {
    systemPrompt: `You are an expert educational content creator specializing in study techniques and learning strategies. Create comprehensive, actionable blog posts that help students improve their learning outcomes.`,
    structure: `
    1. Engaging introduction with a relatable student scenario
    2. 5-7 detailed study techniques with specific examples
    3. Implementation tips and common mistakes to avoid
    4. Real-world applications and success stories
    5. Actionable conclusion with next steps
    `
  },
  'productivity': {
    systemPrompt: `You are a productivity expert who specializes in helping students and professionals optimize their time and focus. Create practical, evidence-based content.`,
    structure: `
    1. Hook with productivity statistics or common challenges
    2. 4-6 proven productivity strategies with step-by-step instructions
    3. Tools and techniques for implementation
    4. Overcoming common productivity obstacles
    5. Clear action plan for readers
    `
  },
  'technology': {
    systemPrompt: `You are an educational technology specialist who stays current with the latest tools and trends in digital learning. Create informative, forward-looking content.`,
    structure: `
    1. Current state of educational technology
    2. 3-5 emerging trends or tools with detailed analysis
    3. Benefits and potential challenges
    4. Implementation strategies for students/educators
    5. Future outlook and recommendations
    `
  },
  'motivation': {
    systemPrompt: `You are a motivational coach specializing in student success and academic achievement. Create inspiring, psychologically-informed content that drives action.`,
    structure: `
    1. Inspirational opening story or quote
    2. 4-5 evidence-based motivation strategies
    3. Overcoming common mental barriers
    4. Building sustainable motivation habits
    5. Empowering call-to-action
    `
  },
  'subject-guide': {
    systemPrompt: `You are an academic expert who creates comprehensive guides for mastering specific subjects. Focus on proven learning methodologies and practical application.`,
    structure: `
    1. Subject overview and importance
    2. Foundation concepts and prerequisites
    3. 5-7 key mastery strategies specific to the subject
    4. Common challenges and solutions
    5. Advanced techniques and resources
    6. Assessment and progress tracking methods
    `
  }
};

const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

const generateSEOContent = (title: string, content: string, keywords: string[]) => {
  // Generate SEO title (under 60 chars)
  const seoTitle = title.length <= 60 ? title : title.substring(0, 57) + '...';
  
  // Generate meta description from first paragraph (under 160 chars)
  const firstParagraph = content.replace(/<[^>]*>/g, '').split('\n')[0] || '';
  const seoDescription = firstParagraph.length <= 160 
    ? firstParagraph 
    : firstParagraph.substring(0, 157) + '...';
  
  return { seoTitle, seoDescription, keywords };
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { queueId, topic, contentType, keywords = [], categoryId, customPrompt }: GenerationRequest = await req.json();

    console.log('Starting blog post generation:', { queueId, topic, contentType });

    // Update queue status to generating
    await supabase
      .from('blog_generation_queue')
      .update({ status: 'generating' })
      .eq('id', queueId);

    const template = CONTENT_TEMPLATES[contentType as keyof typeof CONTENT_TEMPLATES];
    if (!template) {
      throw new Error(`Unknown content type: ${contentType}`);
    }

    // Build the prompt
    const keywordText = keywords.length > 0 ? `Target keywords: ${keywords.join(', ')}` : '';
    const customInstructions = customPrompt ? `Additional instructions: ${customPrompt}` : '';
    
    const prompt = `
    ${template.systemPrompt}

    Topic: ${topic}
    ${keywordText}
    ${customInstructions}

    Please create a comprehensive blog post following this structure:
    ${template.structure}

    Requirements:
    - Write 1500-2500 words
    - Use engaging, conversational tone
    - Include practical examples and actionable advice
    - Optimize for SEO with natural keyword integration
    - Use HTML formatting (h2, h3, p, ul, ol, strong, em tags)
    - Create compelling subheadings
    - Include a strong introduction and conclusion
    - Make it valuable for students and learners

    Return the response in this JSON format:
    {
      "title": "Compelling blog post title",
      "content": "Full HTML-formatted blog post content",
      "excerpt": "Engaging 150-character summary"
    }
    `;

    console.log('Calling OpenAI API...');

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-2025-08-07',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert educational content creator. Always respond with valid JSON containing title, content, and excerpt fields.' 
          },
          { role: 'user', content: prompt }
        ],
        max_completion_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenAI API error:', errorData);
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const aiResponse = await response.json();
    console.log('OpenAI response received');

    if (!aiResponse.choices || !aiResponse.choices[0]) {
      throw new Error('Invalid response from OpenAI API');
    }

    let generatedContent;
    try {
      generatedContent = JSON.parse(aiResponse.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', aiResponse.choices[0].message.content);
      throw new Error('AI response was not valid JSON');
    }

    if (!generatedContent.title || !generatedContent.content) {
      throw new Error('AI response missing required fields (title, content)');
    }

    // Generate additional content
    const slug = generateSlug(generatedContent.title);
    const readingTime = calculateReadingTime(generatedContent.content);
    const seoData = generateSEOContent(generatedContent.title, generatedContent.content, keywords);

    console.log('Creating blog post in database...');

    // Get current user for author_id
    const { data: { user } } = await supabase.auth.getUser();
    const authorId = user?.id;

    // Insert the blog post
    const { data: blogPost, error: insertError } = await supabase
      .from('blog_posts')
      .insert([{
        title: generatedContent.title,
        slug,
        content: generatedContent.content,
        excerpt: generatedContent.excerpt || generatedContent.content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
        status: 'draft',
        reading_time_minutes: readingTime,
        seo_title: seoData.seoTitle,
        seo_description: seoData.seoDescription,
        keywords: seoData.keywords,
        is_ai_generated: true,
        category_id: categoryId || null,
        author_id: authorId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Database insert error:', insertError);
      throw new Error(`Failed to save blog post: ${insertError.message}`);
    }

    console.log('Blog post created successfully:', blogPost.id);

    // Update generation queue with success
    await supabase
      .from('blog_generation_queue')
      .update({ 
        status: 'completed',
        generated_post_id: blogPost.id,
        processed_at: new Date().toISOString()
      })
      .eq('id', queueId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        postId: blogPost.id,
        title: generatedContent.title,
        slug 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-blog-post function:', error);

    // Update queue with error if we have a queueId
    const errorMessage = error.message || 'Unknown error occurred';
    
    try {
      const { queueId } = await req.json();
      if (queueId) {
        await supabase
          .from('blog_generation_queue')
          .update({ 
            status: 'failed',
            error_message: errorMessage,
            processed_at: new Date().toISOString()
          })
          .eq('id', queueId);
      }
    } catch (updateError) {
      console.error('Failed to update queue with error:', updateError);
    }

    console.error('generate-blog-post error:', errorMessage);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate blog post'
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});