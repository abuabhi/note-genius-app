
import { supabase } from "@/integrations/supabase/client";
import { Note } from "@/types/note";

export const updateScanDataInDatabase = async (
  noteId: string, 
  scanData: Note['scanData']
): Promise<void> => {
  if (!scanData) return;

  const { error: scanError } = await supabase
    .from('scan_data')
    .update({
      original_image_url: scanData.originalImageUrl,
      recognized_text: scanData.recognizedText,
      confidence: scanData.confidence,
      language: scanData.language
    })
    .eq('note_id', noteId);

  if (scanError) {
    throw scanError;
  }
};

export const addScanDataToDatabase = async (
  noteId: string, 
  scanData: Note['scanData']
): Promise<void> => {
  if (!scanData) return;

  const { error: scanError } = await supabase
    .from('scan_data')
    .insert({
      note_id: noteId,
      original_image_url: scanData.originalImageUrl,
      recognized_text: scanData.recognizedText,
      confidence: scanData.confidence,
      language: scanData.language
    });

  if (scanError) {
    throw scanError;
  }
};
