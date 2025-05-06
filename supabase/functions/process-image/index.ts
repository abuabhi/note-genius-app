
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4';
import { createWorker } from 'https://esm.sh/tesseract.js@4.1.2';
import { OpenAI } from "https://esm.sh/openai@4.20.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get Supabase URL and key from environment variables
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const openaiApiKey = Deno.env.get('OPENAI_API_KEY');

// Initialize Supabase client with the service role key for admin rights
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { imageUrl, language, userId, useOpenAI = false } = await req.json();
    
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }
    
    // Log processing request
    console.log(`Processing image with language: ${language} for user: ${userId || 'anonymous'}. Using OpenAI: ${useOpenAI}`);

    let extractedText = "";
    let confidence = 0;
    let processedAt = new Date().toISOString();

    // Check if we should use OpenAI or Tesseract
    if (useOpenAI && openaiApiKey) {
      console.log("Using OpenAI for image processing");
      
      // Initialize OpenAI client
      const openai = new OpenAI({
        apiKey: openaiApiKey
      });
      
      // Process image with OpenAI Vision API
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert OCR system. Extract all text visible in the image accurately."
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all text from this image:" },
              { type: "image_url", image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 1000
      });
      
      extractedText = response.choices[0].message.content || "";
      confidence = 0.95; // OpenAI generally has high confidence
      
    } else {
      console.log("Using Tesseract.js for image processing");
      
      try {
        // Initialize Tesseract worker
        const worker = await createWorker(language);
        
        // Process image with Tesseract
        const result = await worker.recognize(imageUrl);
        
        extractedText = result.data.text;
        confidence = result.data.confidence / 100; // Tesseract confidence is 0-100, normalize to 0-1
        
        // Terminate worker
        await worker.terminate();
      } catch (tesseractError) {
        console.error("Tesseract processing error:", tesseractError);
        return new Response(
          JSON.stringify({ error: `OCR processing failed: ${tesseractError.message}` }),
          { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
        );
      }
    }
    
    // If userId is provided, log this activity to a processing_logs table
    if (userId) {
      try {
        const { error } = await supabase
          .from('processing_logs')
          .insert({
            user_id: userId,
            image_url: imageUrl,
            language,
            confidence,
            processed_at: processedAt,
            ocr_method: useOpenAI ? 'openai' : 'tesseract'
          });
          
        if (error) {
          console.error('Error logging processing activity:', error);
        }
      } catch (logError) {
        // Don't fail the main operation if logging fails
        console.error('Failed to log processing activity:', logError);
      }
    }
    
    return new Response(
      JSON.stringify({
        text: extractedText,
        confidence: confidence,
        processedAt: processedAt
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
