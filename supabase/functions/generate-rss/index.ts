import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const escapeXml = (text: string): string => {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
};

const stripHtml = (html: string): string => {
  return html.replace(/<[^>]*>/g, '');
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch latest published blog posts
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select(`
        title,
        slug,
        excerpt,
        content,
        published_at,
        updated_at,
        category:blog_categories(name)
      `)
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching blog posts:', error);
      throw error;
    }

    const baseUrl = 'https://zuhcmwujzfddmafozubd.supabase.co'; // Replace with your actual domain
    const buildDate = new Date().toUTCString();

    // Generate RSS XML
    let rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>PrepGenie Blog</title>
    <description>Study tips, educational technology, and productivity strategies to boost your learning performance</description>
    <link>${baseUrl}/blog</link>
    <language>en-us</language>
    <managingEditor>hello@prepgenie.io (PrepGenie Team)</managingEditor>
    <webMaster>hello@prepgenie.io (PrepGenie Team)</webMaster>
    <lastBuildDate>${buildDate}</lastBuildDate>
    <atom:link href="${baseUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    <generator>PrepGenie Blog System</generator>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/favicon.ico</url>
      <title>PrepGenie Blog</title>
      <link>${baseUrl}/blog</link>
      <width>32</width>
      <height>32</height>
    </image>`;

    // Add blog posts
    posts?.forEach(post => {
      const pubDate = new Date(post.published_at).toUTCString();
      const title = escapeXml(post.title);
      const description = escapeXml(post.excerpt || stripHtml(post.content).substring(0, 200) + '...');
      const content = escapeXml(post.content);
      const category = post.category?.name ? escapeXml(post.category.name) : '';

      rss += `
    <item>
      <title>${title}</title>
      <description>${description}</description>
      <content:encoded><![CDATA[${post.content}]]></content:encoded>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <pubDate>${pubDate}</pubDate>`;
      
      if (category) {
        rss += `
      <category>${category}</category>`;
      }
      
      rss += `
    </item>`;
    });

    rss += `
  </channel>
</rss>`;

    return new Response(rss, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/rss+xml',
        'Cache-Control': 'public, max-age=3600' // Cache for 1 hour
      }
    });

  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});