import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Supabase (service role) and Resend clients
const supabaseUrl = Deno.env.get('SUPABASE_URL') as string;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const resendApiKey = Deno.env.get('RESEND_API_KEY') || '';
const resend = resendApiKey ? new Resend(resendApiKey) : null;

interface TranscriptionRequest {
  audioUrl: string;
  language?: string;
  videoId?: string;
  title?: string;
}

interface GladiaResponse {
  prediction: string;
  prediction_raw?: {
    language: string;
    confidence: number;
    segments?: Array<{
      text: string;
      start: number;
      end: number;
    }>;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioUrl, language = 'english', videoId, title }: TranscriptionRequest = await req.json();

    if (!audioUrl) {
      throw new Error('audioUrl is required');
    }

    console.log(`Starting transcription for audio: ${audioUrl}`);
    console.log(`Video ID: ${videoId}, Title: ${title}`);

    // Fetch the MP3 audio file from the provided URL
    const audioResponse = await fetch(audioUrl);
    
    if (!audioResponse.ok) {
      throw new Error(`Failed to fetch audio from URL: ${audioResponse.status} ${audioResponse.statusText}`);
    }

    // Get the audio as an ArrayBuffer
    const audioBuffer = await audioResponse.arrayBuffer();
    console.log(`Audio file size: ${audioBuffer.byteLength} bytes`);

    // Create FormData for Gladia API
    const formData = new FormData();
    
    // Create a blob from the audio buffer
    const audioBlob = new Blob([audioBuffer], { type: 'audio/mpeg' });
    formData.append('audio', audioBlob, 'audio.mp3');
    formData.append('language', language);
    formData.append('output_format', 'json');

    // Call Gladia transcription API
    const gladiaApiKey = Deno.env.get('GLADIA_API_KEY');
    if (!gladiaApiKey) {
      throw new Error('GLADIA_API_KEY not configured');
    }

    console.log('Sending audio to Gladia for transcription...');
    
    const gladiaResponse = await fetch('https://api.gladia.io/audio/text/audio-transcription/', {
      method: 'POST',
      headers: {
        'x-gladia-key': gladiaApiKey,
      },
      body: formData,
    });

    if (!gladiaResponse.ok) {
      const errorText = await gladiaResponse.text();
      console.error('Gladia API error:', errorText);
      throw new Error(`Gladia API error: ${gladiaResponse.status} ${gladiaResponse.statusText}. Details: ${errorText}`);
    }

    const gladiaResult: GladiaResponse = await gladiaResponse.json();
    console.log('Transcription completed successfully');

    // Prepare the response
    const response = {
      success: true,
      transcription: gladiaResult.prediction,
      metadata: {
        videoId: videoId || null,
        title: title || null,
        audioUrl,
        language: gladiaResult.prediction_raw?.language || language,
        confidence: gladiaResult.prediction_raw?.confidence || null,
        segments: gladiaResult.prediction_raw?.segments || null,
        timestamp: new Date().toISOString(),
      }
    };

    console.log(`Transcription result: ${gladiaResult.prediction.substring(0, 100)}...`);

    // Usage tracking and milestone alerts
    try {
      // 1) Insert usage log
      const { error: usageError } = await supabase.from('transcription_usage').insert({
        video_id: videoId ?? null,
        title: title ?? null,
        provider: 'gladia',
        source_url: audioUrl,
        metadata: {
          confidence: gladiaResult.prediction_raw?.confidence ?? null,
          language: gladiaResult.prediction_raw?.language ?? language,
        },
      });
      if (usageError) {
        console.error('Failed to log transcription usage:', usageError);
      }

      // 2) Fetch settings (email + base_offset)
      const { data: settings } = await supabase
        .from('transcription_settings')
        .select('alert_email, base_offset')
        .maybeSingle();
      const alertEmail = settings?.alert_email ?? 'hello@prepgenie.io';
      const baseOffset = settings?.base_offset ?? 13;

      // 3) Get total count (including base offset)
      const { count } = await supabase
        .from('transcription_usage')
        .select('*', { count: 'exact', head: true });
      const totalCount = (baseOffset || 0) + (count || 0);
      console.log('[USAGE] Current transcription total (with offset):', totalCount);

      // 4) Determine if a milestone was reached
      let milestoneToNotify: number | null = null;
      if (totalCount >= 800) {
        milestoneToNotify = 800;
      }
      if (totalCount % 100 === 0) {
        milestoneToNotify = totalCount; // 100, 200, 300, ...
      }

      if (milestoneToNotify) {
        const { data: existingAlert } = await supabase
          .from('transcription_usage_alerts')
          .select('id')
          .eq('milestone', milestoneToNotify)
          .maybeSingle();

        if (!existingAlert) {
          // Send email if Resend is configured
          if (resend) {
            const subject = `Transcriptions reached ${totalCount} (milestone ${milestoneToNotify})`;
            const html = `
              <h2>Transcription usage alert</h2>
              <p>Total transcriptions: <strong>${totalCount}</strong></p>
              <p>Milestone: <strong>${milestoneToNotify}</strong></p>
              <p>You pay $7 per 1000 transcriptions (~$0.007 each). Consider topping up before reaching 1000.</p>
              <p>Latest video: ${title ? `<strong>${title}</strong>` : 'N/A'} ${videoId ? `(ID: ${videoId})` : ''}</p>
            `;
            try {
              // deno-lint-ignore no-explicit-any
              const emailResp: any = await resend.emails.send({
                from: 'PrepGenie <no-reply@prepgenie.io>',
                to: [alertEmail],
                subject,
                html,
              });
              console.log('Alert email sent:', emailResp?.id ?? 'ok');
            } catch (e) {
              console.error('Failed to send alert email via Resend:', e);
            }
          } else {
            console.warn('RESEND_API_KEY not configured; skipping email alert');
          }

          const { error: alertInsertErr } = await supabase
            .from('transcription_usage_alerts')
            .insert({ milestone: milestoneToNotify, total_count: totalCount, email: alertEmail });
          if (alertInsertErr) {
            console.error('Failed to record milestone alert:', alertInsertErr);
          }
        }
      }
    } catch (trackingError) {
      console.error('Usage tracking failed:', trackingError);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in youtube-transcription function:', error);
    
    return new Response(JSON.stringify({ 
      success: false,
      error: (error as Error)?.message ?? String(error),
      timestamp: new Date().toISOString(),
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});