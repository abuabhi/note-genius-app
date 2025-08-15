import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, monitorData } = await req.json();
    const apiKey = Deno.env.get('UPTIMEROBOT_API_KEY');
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'UptimeRobot API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const baseUrl = 'https://api.uptimerobot.com/v2';
    let endpoint = '';
    let body = `api_key=${apiKey}&format=json`;

    switch (action) {
      case 'getMonitors':
        endpoint = '/getMonitors';
        body += '&response_times=1&response_times_limit=24&logs=1&logs_limit=10';
        break;
        
      case 'createMonitor':
        endpoint = '/newMonitor';
        body += `&friendly_name=${encodeURIComponent(monitorData.name)}`;
        body += `&url=${encodeURIComponent(monitorData.url)}`;
        body += `&type=${monitorData.type || 1}`; // Default to HTTP(s)
        body += `&interval=${monitorData.interval || 300}`; // Default to 5 minutes
        break;
        
      case 'deleteMonitor':
        endpoint = '/deleteMonitor';
        body += `&id=${monitorData.id}`;
        break;
        
      case 'editMonitor':
        endpoint = '/editMonitor';
        body += `&id=${monitorData.id}`;
        if (monitorData.name) body += `&friendly_name=${encodeURIComponent(monitorData.name)}`;
        if (monitorData.url) body += `&url=${encodeURIComponent(monitorData.url)}`;
        break;
        
      case 'getAccountDetails':
        endpoint = '/getAccountDetails';
        break;
        
      default:
        return new Response(
          JSON.stringify({ error: 'Invalid action' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }

    console.log(`UptimeRobot API call: ${action} to ${endpoint}`);
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body,
    });

    const data = await response.json();
    
    if (data.stat === 'fail') {
      console.error('UptimeRobot API error:', data.error);
      return new Response(
        JSON.stringify({ error: data.error?.message || 'UptimeRobot API error' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`UptimeRobot API success: ${action}`);
    
    return new Response(
      JSON.stringify({ success: true, data: data }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in uptimerobot-api function:', error);
    
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});