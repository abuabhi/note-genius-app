
import React from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

interface EmailActionProps {
  noteTitle: string;
  noteContent: string;
}

export const EmailAction = ({ noteTitle, noteContent }: EmailActionProps) => {
  const handleEmail = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Check if content is too large for mailto
    if (noteContent.length > 1500) {
      toast.loading("Preparing email...");
      
      try {
        // Use edge function for sending email
        const { data, error } = await supabase.functions.invoke("send-note-email", {
          body: { 
            noteTitle, 
            noteContent,
            recipient: "" // We'll add recipient UI later
          }
        });
        
        if (error) {
          throw new Error(error.message || "Failed to send email");
        }
        
        toast.dismiss();
        toast.success("Email sent successfully");
      } catch (error) {
        console.error("Error sending email:", error);
        toast.dismiss();
        toast.error("Failed to send email. Trying fallback method...");
        
        // Fallback to mailto for short content
        tryMailtoFallback(noteTitle, noteContent);
      }
    } else {
      // Use mailto for shorter content
      tryMailtoFallback(noteTitle, noteContent);
    }
  };
  
  const tryMailtoFallback = (title: string, content: string) => {
    try {
      // Create a mailto link with the note content
      const subject = encodeURIComponent(`Note: ${title}`);
      const body = encodeURIComponent(`${title}\n\n${content}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      toast.success("Email client opened");
    } catch (error) {
      toast.error("Failed to open email client");
    }
  };

  return (
    <DropdownMenuItem 
      className="flex items-center cursor-pointer" 
      onClick={handleEmail}
    >
      <Mail className="mr-2 h-4 w-4" />
      <span>Email</span>
    </DropdownMenuItem>
  );
};
