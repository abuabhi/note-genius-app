
import { supabase } from "@/integrations/supabase/client";

export interface ProcessResult {
  fileUrl: string | null;
  text: string;
  title: string;
}

export const uploadFileToStorage = async (file: File): Promise<string | null> => {
  try {
    // Get current user and generate path
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error("User not authenticated");
    }
    
    const userId = session.user.id;
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('note_images')
      .upload(fileName, file);
    
    if (error) throw error;
    
    // Get the public URL
    const { data: urlData } = supabase.storage
      .from('note_images')
      .getPublicUrl(data.path);
    
    return urlData.publicUrl;
  } catch (error) {
    console.error('Error uploading file:', error);
    return null;
  }
};

export const processSelectedDocument = async (
  file: File | null,
  fileType: string | null
): Promise<ProcessResult> => {
  if (!file && !fileType) {
    throw new Error("No file or file type provided");
  }

  let uploadedUrl = null;
  
  // If we have a file, upload it first
  if (file) {
    uploadedUrl = await uploadFileToStorage(file);
    if (!uploadedUrl) {
      throw new Error("Failed to upload file");
    }

    // Call our edge function to process the document
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user.id;

    const response = await supabase.functions.invoke('process-document', {
      body: {
        fileUrl: uploadedUrl,
        fileType: fileType,
        userId: userId
      }
    });

    if (response.error) {
      throw new Error(response.error.message || 'Error processing document');
    }

    return {
      fileUrl: uploadedUrl,
      text: response.data.text,
      title: response.data.title
    };
  } else {
    // This is for API import where we don't have a file
    return {
      fileUrl: null,
      text: "Placeholder text for API import",
      title: `Imported ${fileType} Document`
    };
  }
};
