import React from 'react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { TestTube } from 'lucide-react';

export const ImportTestButton = () => {
  const testStorageAccess = async () => {
    try {
      // Test creating a simple file
      const testFile = new File(['test content'], 'test.txt', { type: 'text/plain' });
      const timestamp = Date.now();
      const fileName = `test-${timestamp}.txt`;
      
      const { data, error } = await supabase.storage
        .from('note_images')
        .upload(`test/${fileName}`, testFile);

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('note_images')
        .getPublicUrl(`test/${fileName}`);

      // Test access to the URL
      const response = await fetch(urlData.publicUrl);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Clean up
      await supabase.storage
        .from('note_images')
        .remove([`test/${fileName}`]);

      toast.success('✅ Storage access test passed! PDF imports should work now.');
    } catch (error) {
      console.error('Storage test failed:', error);
      toast.error(`❌ Storage test failed: ${error.message}`);
    }
  };

  return (
    <Button
      onClick={testStorageAccess}
      variant="outline"
      size="sm"
      className="flex items-center gap-2"
    >
      <TestTube className="h-4 w-4" />
      Test Storage
    </Button>
  );
};