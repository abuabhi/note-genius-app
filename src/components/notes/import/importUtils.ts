
import { supabase } from "@/integrations/supabase/client";

export interface ProcessResult {
  fileUrl: string | null;
  text: string;
  title: string;
  metadata?: Record<string, any>; // Added metadata property
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
  fileType: string | null,
  apiParams?: Record<string, any>
): Promise<ProcessResult> => {
  if (!fileType) {
    throw new Error("No file type provided");
  }

  let uploadedUrl = null;
  
  // Get user session for user ID
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user.id;
  
  // If we have a file, upload it first
  if (file) {
    uploadedUrl = await uploadFileToStorage(file);
    if (!uploadedUrl) {
      throw new Error("Failed to upload file");
    }

    // Call our edge function to process the document
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
      text: response.data.text || "No text could be extracted",
      title: response.data.title || `Imported ${fileType.toUpperCase()} Document`,
      metadata: response.data.metadata || {} // Added metadata handling
    };
  } else if (apiParams) {
    // This is for API import where we use external service parameters
    const response = await supabase.functions.invoke('process-document', {
      body: {
        fileType: fileType,
        userId: userId,
        externalApiParams: apiParams
      }
    });

    if (response.error) {
      throw new Error(response.error.message || 'Error processing document from API');
    }

    return {
      fileUrl: null,
      text: response.data.text || "No text could be extracted from API",
      title: response.data.title || `Imported ${fileType} Document`,
      metadata: response.data.metadata || {} // Added metadata handling
    };
  } else {
    throw new Error("Either file or API parameters must be provided");
  }
};
