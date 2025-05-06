
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { imageUrl, language } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // In a real implementation, we would call a real OCR service here
    // For now, simulate OCR processing with different languages
    const processingTime = language === 'eng' ? 1000 : 1500;
    
    // Simulate OCR processing
    let simulatedText = "";
    let confidence = 0.85;
    
    // Simulate different text based on language
    switch (language || 'eng') {
      case 'eng':
        simulatedText = "This is simulated OCR text in English from our Supabase Edge Function. In a real implementation, we would extract text from the image using an OCR API.";
        confidence = 0.92;
        break;
      case 'fra':
        simulatedText = "Voici un texte OCR simulé en français de notre fonction Edge Supabase. Dans une implémentation réelle, nous extrairions du texte de l'image.";
        confidence = 0.88;
        break;
      case 'spa':
        simulatedText = "Este es un texto OCR simulado en español de nuestra función Edge de Supabase. En una implementación real, extraeríamos texto de la imagen.";
        confidence = 0.86;
        break;
      default:
        simulatedText = "This is simulated OCR text from our Supabase Edge Function. In a real implementation, we would extract text from the image using an OCR API.";
        confidence = 0.82;
    }
    
    return new Response(
      JSON.stringify({
        text: simulatedText,
        confidence: confidence
      }),
      { status: 200, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
    
  } catch (error) {
    console.error('Error processing image:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
});
