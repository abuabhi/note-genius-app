import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🧹 Starting cleanup of contaminated content expansions...');

    // Delete expansions with invalid UUIDs or wrong content types
    const { error: deleteError, count } = await supabase
      .from('note_content_expansions')
      .delete()
      .or(
        'note_id.like.*crypto.randomUUID*,' +
        'content_type.in.(summarize,extract-key-points,improve-clarity,convert-to-markdown,enrich-note),' +
        'note_id.is.null'
      );

    if (deleteError) {
      throw deleteError;
    }

    console.log(`✅ Cleanup completed. Removed ${count || 0} contaminated expansions.`);

    return new Response(JSON.stringify({ 
      success: true, 
      cleanedCount: count || 0,
      message: 'Contaminated expansions cleaned up successfully'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('💥 Cleanup failed:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});