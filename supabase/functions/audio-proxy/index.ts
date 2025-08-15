import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, range',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
};

async function handleExternalAudioProxy(req: Request, externalUrl: string): Promise<Response> {
  try {
    // Validate the URL
    let audioUrl: URL;
    try {
      audioUrl = new URL(externalUrl);
    } catch {
      return new Response('Invalid URL', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Only allow specific trusted domains (security measure)
    const allowedDomains = ['cdn.pixabay.com', 'pixabay.com'];
    if (!allowedDomains.some(domain => audioUrl.hostname.endsWith(domain))) {
      return new Response('Domain not allowed', { 
        status: 403, 
        headers: corsHeaders 
      });
    }

    console.log('Proxying external audio URL:', externalUrl);

    // Get the Range header for partial content support (audio seeking)
    const rangeHeader = req.headers.get('range');
    const requestHeaders: HeadersInit = {
      'User-Agent': 'Lovable Audio Proxy/1.0',
    };
    
    if (rangeHeader) {
      requestHeaders['Range'] = rangeHeader;
    }

    // Fetch the audio file from external source
    const audioResponse = await fetch(externalUrl, {
      headers: requestHeaders,
    });

    if (!audioResponse.ok) {
      console.error('Failed to fetch external audio:', audioResponse.status, audioResponse.statusText);
      return new Response('External audio not found', { 
        status: audioResponse.status, 
        headers: corsHeaders 
      });
    }

    // Create response headers
    const responseHeaders = new Headers(corsHeaders);
    
    // Copy relevant headers from the external response
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
    const contentLength = audioResponse.headers.get('content-length');
    const acceptRanges = audioResponse.headers.get('accept-ranges');
    const contentRange = audioResponse.headers.get('content-range');
    
    responseHeaders.set('Content-Type', contentType);
    
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }
    
    if (acceptRanges) {
      responseHeaders.set('Accept-Ranges', acceptRanges);
    }
    
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    // Set cache headers for better performance
    responseHeaders.set('Cache-Control', 'public, max-age=1800'); // 30 minutes for external content

    console.log('Successfully proxied external audio, content-type:', contentType);

    // Return the audio stream with proper status code
    return new Response(audioResponse.body, {
      status: audioResponse.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('External audio proxy error:', error);
    return new Response('Failed to proxy external audio', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'GET') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const url = new URL(req.url);
    const filePath = url.searchParams.get('path');
    const externalUrl = url.searchParams.get('url');
    
    // Handle external URL proxying (for Pixabay and other external sources)
    if (externalUrl) {
      return await handleExternalAudioProxy(req, externalUrl);
    }
    
    // Handle internal Supabase storage files
    if (!filePath) {
      return new Response('Missing path or url parameter', { 
        status: 400, 
        headers: corsHeaders 
      });
    }

    // Initialize Supabase client with service role key for server-side operations
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Generate a signed URL for the audio file (1 hour expiry)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('study-music')
      .createSignedUrl(filePath, 3600);

    if (urlError || !signedUrlData?.signedUrl) {
      console.error('Failed to get signed URL:', urlError);
      return new Response('Audio file not found', { 
        status: 404, 
        headers: corsHeaders 
      });
    }

    // Get the Range header for partial content support (audio seeking)
    const rangeHeader = req.headers.get('range');
    const requestHeaders: HeadersInit = {};
    
    if (rangeHeader) {
      requestHeaders['Range'] = rangeHeader;
    }

    // Fetch the audio file from Supabase storage
    const audioResponse = await fetch(signedUrlData.signedUrl, {
      headers: requestHeaders,
    });

    if (!audioResponse.ok) {
      return new Response('Failed to fetch audio', { 
        status: audioResponse.status, 
        headers: corsHeaders 
      });
    }

    // Create response headers
    const responseHeaders = new Headers(corsHeaders);
    
    // Copy relevant headers from the storage response
    const contentType = audioResponse.headers.get('content-type') || 'audio/mpeg';
    const contentLength = audioResponse.headers.get('content-length');
    const acceptRanges = audioResponse.headers.get('accept-ranges');
    const contentRange = audioResponse.headers.get('content-range');
    
    responseHeaders.set('Content-Type', contentType);
    
    if (contentLength) {
      responseHeaders.set('Content-Length', contentLength);
    }
    
    if (acceptRanges) {
      responseHeaders.set('Accept-Ranges', acceptRanges);
    }
    
    if (contentRange) {
      responseHeaders.set('Content-Range', contentRange);
    }

    // Set cache headers for better performance
    responseHeaders.set('Cache-Control', 'public, max-age=3600');

    // Return the audio stream with proper status code
    return new Response(audioResponse.body, {
      status: audioResponse.status,
      headers: responseHeaders,
    });

  } catch (error) {
    console.error('Audio proxy error:', error);
    return new Response('Internal server error', { 
      status: 500, 
      headers: corsHeaders 
    });
  }
});