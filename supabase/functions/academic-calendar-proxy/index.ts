
import { corsHeaders } from '../_shared/cors.ts';

const OPENHOLIDAYS_BASE_URL = 'https://openholidaysapi.org';

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { endpoint, params } = await req.json();
    
    // Construct the API URL
    let url = `${OPENHOLIDAYS_BASE_URL}/${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    console.log('Fetching from OpenHolidays API:', url);

    // Make the API request
    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'StudyHive-Academic-Calendar/1.0'
      }
    });

    if (!response.ok) {
      throw new Error(`OpenHolidays API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({ data, success: true }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );

  } catch (error) {
    console.error('Academic Calendar Proxy Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message,
        success: false
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
