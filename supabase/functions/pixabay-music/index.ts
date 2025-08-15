import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { corsHeaders } from '../_shared/cors.ts'

interface PixabayTrack {
  id: number;
  previewURL: string;
  tags: string;
  user: string;
  duration: number;
  downloads: number;
  likes: number;
  webformatURL: string;
  [key: string]: any;
}

interface PixabayResponse {
  total: number;
  totalHits: number;
  hits: PixabayTrack[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, category = 'music', audioType = 'music', perPage = 20, page = 1 } = await req.json()

    // Get API key from environment
    const apiKey = Deno.env.get('PIXABAY_API_KEY')
    if (!apiKey) {
      throw new Error('PIXABAY_API_KEY not configured')
    }

    // Build API URL
    const params = new URLSearchParams({
      key: apiKey,
      q: encodeURIComponent(query),
      category,
      audio_type: audioType,
      per_page: perPage.toString(),
      page: page.toString(),
      safesearch: 'true'
    })

    console.log('Fetching from Pixabay API:', `https://pixabay.com/api/?${params}`)

    // Make request to Pixabay API
    const response = await fetch(`https://pixabay.com/api/?${params}`)
    
    if (!response.ok) {
      throw new Error(`Pixabay API error: ${response.status} - ${response.statusText}`)
    }

    const data: PixabayResponse = await response.json()
    
    console.log(`Successfully fetched ${data.hits.length} tracks for query: ${query}`)

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in pixabay-music function:', error)
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        hits: [],
        total: 0,
        totalHits: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})