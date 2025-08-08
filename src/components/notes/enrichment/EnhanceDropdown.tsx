
import React from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Sparkles } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface EnhanceDropdownProps {
  noteId: string;
  noteContent: string;
  onEnhancement?: (content: string) => void;
}

export const EnhanceDropdown = ({
  noteId,
  noteContent,
  onEnhancement,
}: EnhanceDropdownProps) => {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleEnhancementSelect = async (enhancementType: string) => {
    if (!noteId || !noteContent) return;
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('enrich-note', {
        body: { 
          noteId, 
          noteContent, 
          enhancementType, 
          noteTitle: 'Enhanced Content' 
        }
      });

      if (error) throw error;
      
      if (data.enhancedContent && onEnhancement) {
        onEnhancement(data.enhancedContent);
        toast.success('Enhancement completed successfully!');
      }
    } catch (error) {
      console.error("Error enhancing note:", error);
      toast.error("Failed to enhance note");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          disabled={isProcessing}
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Enhance
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleEnhancementSelect('summary')}
          disabled={isProcessing}
        >
          Generate Summary
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleEnhancementSelect('extract-key-points')}
          disabled={isProcessing}
        >
          Extract Key Points
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleEnhancementSelect('generate-questions')}
          disabled={isProcessing}
        >
          Generate Questions
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
