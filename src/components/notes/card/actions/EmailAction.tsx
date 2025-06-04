
import React from "react";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";
import { Mail } from "lucide-react";
import { toast } from "sonner";

interface EmailActionProps {
  noteTitle: string;
  noteContent: string;
}

export const EmailAction = ({ noteTitle, noteContent }: EmailActionProps) => {
  const handleEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    
    console.log("Email action triggered", { noteTitle, contentLength: noteContent?.length || 0 });
    
    try {
      const title = noteTitle || 'Untitled Note';
      const content = noteContent || 'No content available';
      
      const subject = encodeURIComponent(`Note: ${title}`);
      const body = encodeURIComponent(content);
      const mailtoLink = `mailto:?subject=${subject}&body=${body}`;
      
      console.log("Opening mailto link:", mailtoLink);
      
      // Open email client
      const opened = window.open(mailtoLink, '_blank');
      
      if (opened === null) {
        console.warn("Popup blocked, trying direct navigation");
        window.location.href = mailtoLink;
      }
      
      toast.success("Opening email client...");
      console.log("Email client opened successfully");
    } catch (error) {
      console.error("Email action failed:", error);
      toast.error("Failed to open email client");
    }
  };

  return (
    <DropdownMenuItem 
      onClick={handleEmail}
      className="flex items-center cursor-pointer px-3 py-3 rounded-lg hover:bg-mint-50 transition-colors duration-200 group"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg mr-3 group-hover:bg-blue-200 transition-colors duration-200">
        <Mail className="h-4 w-4 text-blue-600" />
      </div>
      <span className="text-sm font-medium text-gray-900">Send via Email</span>
    </DropdownMenuItem>
  );
};
