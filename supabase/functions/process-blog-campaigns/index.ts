import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

interface Campaign {
  id: string;
  user_id: string;
  name: string;
  topic_strategy: string;
  fixed_topic: string;
  keywords: string[];
  frequency_type: string;
  frequency_value: number;
  auto_publish: boolean;
  publish_delay_hours: number;
  content_type: string;
  min_word_count: number;
  max_word_count: number;
  seo_keywords: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Processing blog campaigns...');
    
    const body = await req.json().catch(() => ({}));
    const { campaignId, runNow } = body;

    let campaigns: Campaign[] = [];

    if (campaignId) {
      // Run specific campaign
      const { data, error } = await supabase
        .from('blog_campaigns')
        .select('*')
        .eq('id', campaignId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching campaign:', error);
        throw error;
      }

      if (data) {
        campaigns = [data];
      }
    } else {
      // Check for due campaigns
      const { data, error } = await supabase
        .from('blog_campaigns')
        .select('*')
        .eq('is_active', true)
        .eq('status', 'active')
        .lt('next_run_at', new Date().toISOString());

      if (error) {
        console.error('Error fetching due campaigns:', error);
        throw error;
      }

      campaigns = data || [];
    }

    console.log(`Found ${campaigns.length} campaigns to process`);

    const results = [];
    
    for (const campaign of campaigns) {
      try {
        console.log(`Processing campaign: ${campaign.name}`);
        
        // Log campaign run start
        const { data: runRecord, error: runError } = await supabase
          .from('blog_campaign_runs')
          .insert({
            campaign_id: campaign.id,
            status: 'processing'
          })
          .select()
          .single();

        if (runError) {
          console.error('Error creating run record:', runError);
          continue;
        }

        const result = await processCampaign(campaign);
        results.push(result);

        // Update campaign next run time if not running manually
        if (!runNow) {
          const nextRun = calculateNextRun(campaign.frequency_type, campaign.frequency_value);
          await supabase
            .from('blog_campaigns')
            .update({
              last_run_at: new Date().toISOString(),
              next_run_at: nextRun
            })
            .eq('id', campaign.id);
        }

        // Update run record with success
        await supabase
          .from('blog_campaign_runs')
          .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            blog_post_id: result.blogPostId,
            topic_used: result.topic
          })
          .eq('id', runRecord.id);

        console.log(`Successfully processed campaign: ${campaign.name}`);
        
      } catch (error) {
        console.error(`Error processing campaign ${campaign.name}:`, error);
        
        // Update run record with error
        if (runRecord) {
          await supabase
            .from('blog_campaign_runs')
            .update({
              status: 'failed',
              error_message: error.message,
              completed_at: new Date().toISOString()
            })
            .eq('id', runRecord.id);
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      processed: campaigns.length,
      results
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in process-blog-campaigns:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function processCampaign(campaign: Campaign) {
  console.log(`Generating content for campaign: ${campaign.name}`);
  
  // Determine topic based on strategy
  let topic = '';
  
  switch (campaign.topic_strategy) {
    case 'fixed':
      topic = campaign.fixed_topic;
      break;
      
    case 'rotation':
      // Get next topic from rotation
      const { data: nextTopic } = await supabase.rpc('get_next_campaign_topic', {
        p_campaign_id: campaign.id
      });
      topic = nextTopic || generateRandomTopic(campaign.keywords);
      break;
      
    case 'keywords':
      topic = generateTopicFromKeywords(campaign.keywords);
      break;
      
    default: // 'random'
      topic = generateRandomTopic(campaign.keywords);
      break;
  }

  console.log(`Generated topic: ${topic}`);

  // Generate content using OpenAI
  const content = await generateBlogContent(campaign, topic);
  
  // Create blog post
  const status = campaign.auto_publish ? 
    (campaign.publish_delay_hours > 0 ? 'scheduled' : 'published') : 
    'draft';
    
  let publishedAt = null;
  let scheduledFor = null;
  
  if (campaign.auto_publish) {
    if (campaign.publish_delay_hours > 0) {
      scheduledFor = new Date(Date.now() + campaign.publish_delay_hours * 60 * 60 * 1000).toISOString();
    } else {
      publishedAt = new Date().toISOString();
    }
  }

  const { data: blogPost, error } = await supabase
    .from('blog_posts')
    .insert({
      title: content.title,
      slug: generateSlug(content.title),
      content: content.content,
      excerpt: content.excerpt,
      meta_title: content.metaTitle,
      meta_description: content.metaDescription,
      status,
      published_at: publishedAt,
      scheduled_for: scheduledFor,
      author_id: campaign.user_id,
      auto_generated: true,
      seo_score: content.seoScore || 85,
      reading_time: Math.ceil(content.content.length / 200), // Rough estimate
      featured: false
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }

  console.log(`Created blog post: ${blogPost.title} (${blogPost.id})`);
  
  return {
    campaignId: campaign.id,
    blogPostId: blogPost.id,
    topic,
    title: content.title,
    status: blogPost.status
  };
}

async function generateBlogContent(campaign: Campaign, topic: string) {
  if (!openAIApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const contentTypePrompts = {
    educational: "Write an educational and informative blog post that teaches readers about",
    howto: "Write a detailed how-to guide that provides step-by-step instructions for",
    tips: "Write a practical tips and tricks blog post about",
    news: "Write a news-style blog post analyzing recent developments in",
    review: "Write a comprehensive review and analysis of"
  };

  const basePrompt = contentTypePrompts[campaign.content_type] || contentTypePrompts.educational;
  
  const keywordContext = campaign.seo_keywords.length > 0 
    ? `Include these SEO keywords naturally: ${campaign.seo_keywords.join(', ')}`
    : '';
    
  const contentKeywords = campaign.keywords.length > 0
    ? `Content should focus on: ${campaign.keywords.join(', ')}`
    : '';

  const prompt = `
${basePrompt} "${topic}".

Requirements:
- Word count: ${campaign.min_word_count}-${campaign.max_word_count} words
- Write in a engaging, informative tone
- Include proper headings and structure
- Make it SEO-friendly and educational
- ${keywordContext}
- ${contentKeywords}

Format the response as JSON with:
{
  "title": "Engaging blog post title (max 60 characters)",
  "excerpt": "Brief summary (max 160 characters)",
  "content": "Full blog post content in markdown format",
  "metaTitle": "SEO title (max 60 characters)",
  "metaDescription": "SEO description (max 160 characters)",
  "seoScore": 85
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
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert content writer specializing in educational blog content. Always respond with valid JSON.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 3000
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('OpenAI API error:', errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const generatedText = data.choices[0].message.content;

  try {
    const content = JSON.parse(generatedText);
    console.log('Generated content successfully');
    return content;
  } catch (parseError) {
    console.error('Error parsing OpenAI response:', parseError);
    // Fallback to basic content structure
    return {
      title: `${topic} - Complete Guide`,
      excerpt: `Learn everything you need to know about ${topic} in this comprehensive guide.`,
      content: `# ${topic}\n\n${generatedText}`,
      metaTitle: `${topic} - Complete Guide`,
      metaDescription: `Learn everything you need to know about ${topic} in this comprehensive guide.`,
      seoScore: 75
    };
  }
}

function generateRandomTopic(keywords: string[] = []) {
  const educationalTopics = [
    "Effective Study Techniques for Better Learning",
    "Time Management Strategies for Students", 
    "Memory Improvement Methods",
    "Note-Taking Best Practices",
    "Preparing for Exams Successfully",
    "Building Strong Study Habits",
    "Overcoming Learning Challenges",
    "Digital Tools for Modern Learning",
    "Creating an Ideal Study Environment",
    "Motivation Techniques for Students"
  ];
  
  if (keywords.length > 0) {
    const keyword = keywords[Math.floor(Math.random() * keywords.length)];
    return `Advanced ${keyword} Techniques and Strategies`;
  }
  
  return educationalTopics[Math.floor(Math.random() * educationalTopics.length)];
}

function generateTopicFromKeywords(keywords: string[]) {
  if (keywords.length === 0) {
    return generateRandomTopic();
  }
  
  const keyword = keywords[Math.floor(Math.random() * keywords.length)];
  const formats = [
    `Master ${keyword}: A Complete Guide`,
    `${keyword} Best Practices for Success`,
    `Advanced ${keyword} Techniques`,
    `Everything You Need to Know About ${keyword}`,
    `${keyword} Tips and Strategies`
  ];
  
  return formats[Math.floor(Math.random() * formats.length)];
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 50);
}

function calculateNextRun(frequencyType: string, frequencyValue: number): string {
  const now = new Date();
  
  switch (frequencyType) {
    case 'days':
      now.setDate(now.getDate() + frequencyValue);
      break;
    case 'weeks':
      now.setDate(now.getDate() + (frequencyValue * 7));
      break;
    case 'months':
      now.setMonth(now.getMonth() + frequencyValue);
      break;
    default:
      now.setDate(now.getDate() + frequencyValue);
  }
  
  return now.toISOString();
}