
import { corsHeaders } from '../_shared/cors.ts';

const OPENHOLIDAYS_BASE_URL = 'https://openholidaysapi.org';

Deno.serve(async (req) => {
  console.log('Academic Calendar Proxy - Request received:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Academic Calendar Proxy - Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestBody = await req.json();
    console.log('Academic Calendar Proxy - Request body:', requestBody);
    
    const { endpoint, params } = requestBody;
    
    if (!endpoint) {
      throw new Error('Missing endpoint parameter');
    }
    
    // Construct the API URL
    let url = `${OPENHOLIDAYS_BASE_URL}/${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    console.log('Academic Calendar Proxy - Fetching from OpenHolidays API:', url);

    // Make the API request with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'StudyHive-Academic-Calendar/1.0'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      console.log('Academic Calendar Proxy - OpenHolidays response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Academic Calendar Proxy - OpenHolidays API error:', response.status, errorText);
        throw new Error(`OpenHolidays API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Academic Calendar Proxy - Data received, count:', Array.isArray(data) ? data.length : 'not array');
      
      return new Response(
        JSON.stringify({ data, success: true }),
        {
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );

    } catch (fetchError) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        throw new Error('Request timeout - OpenHolidays API took too long to respond');
      }
      throw fetchError;
    }

  } catch (error) {
    console.error('Academic Calendar Proxy - Error:', error);
    
    return new Response(
      JSON.stringify({
        error: error.message || 'Unknown error occurred',
        success: false
      }),
      {
        status: error.message?.includes('timeout') ? 408 : 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
