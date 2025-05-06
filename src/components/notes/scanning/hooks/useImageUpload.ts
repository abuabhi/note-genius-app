
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useImageUpload = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const { toast } = useToast();

  const handleImageCaptured = (imageUrl: string) => {
    setCapturedImage(imageUrl);
  };

  const uploadImageToStorage = async (imageUrl: string): Promise<string | null> => {
    try {
      // Extract base64 data
      const base64Data = imageUrl.split(',')[1];
      
      // Convert to Blob
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/png' });
      
      // Get current user and generate path
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error("User not authenticated");
      }
      
      const userId = session.user.id;
      const fileName = `${userId}/${Date.now()}.png`;
      
      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('note_images')
        .upload(fileName, blob);
      
      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('note_images')
        .getPublicUrl(data.path);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Upload Failed",
        description: "Could not upload image to storage.",
        variant: "destructive",
      });
      return null;
    }
  };

  return {
    capturedImage,
    setCapturedImage,
    handleImageCaptured,
    uploadImageToStorage
  };
};
