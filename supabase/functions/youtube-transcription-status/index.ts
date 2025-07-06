import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// n8n status endpoint (you'll need to provide this from your n8n setup)
const N8N_STATUS_URL = 'https://n8n.srv538007.hstgr.cloud/webhook-test/sWcYmc7znvGIs5Vo/youtube%20webhook/status';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const requestId = url.searchParams.get('requestId');
    
    if (!requestId) {
      throw new Error('Request ID is required');
    }

    console.log('🔍 Checking status for request:', requestId);

    // Check status with n8n
    const statusResponse = await fetch(`${N8N_STATUS_URL}?requestId=${requestId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      console.error('❌ Status check failed:', errorText);
      throw new Error(`Status check failed: ${statusResponse.status}`);
    }

    const statusData = await statusResponse.json();
    console.log('📊 Status response:', statusData);

    // Return the status
    return new Response(JSON.stringify(statusData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Status check error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      processingStatus: 'error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});