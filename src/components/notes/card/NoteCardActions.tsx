
import React from "react";
import { MoreHorizontal, Pin, Trash2, Download, Mail, FileText, FilePdf } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { jsPDF } from "jspdf";
import { supabase } from "@/integrations/supabase/client";

interface NoteCardActionsProps {
  noteId: string;
  noteTitle: string;
  noteContent?: string;
  isPinned: boolean;
  onPin: (id: string, isPinned: boolean, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  iconSize?: number;
}

export const NoteCardActions = ({
  noteId,
  noteTitle,
  noteContent = "",
  isPinned,
  onPin,
  onDelete,
  iconSize = 4
}: NoteCardActionsProps) => {
  const handleAction = (
    action: (id: string, ...args: any[]) => void,
    ...args: any[]
  ) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action(noteId, ...args);
  };

  const handleDownloadAsPDF = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      toast.loading("Generating PDF...");
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(18);
      doc.text(noteTitle, 20, 20);
      
      // Add content with word wrap
      doc.setFontSize(12);
      const splitText = doc.splitTextToSize(noteContent, 170);
      doc.text(splitText, 20, 30);
      
      // Save the PDF
      doc.save(`${noteTitle.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast.dismiss();
      toast.success("PDF downloaded successfully");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.dismiss();
      toast.error("Failed to generate PDF");
    }
  };

  const handleDownloadAsMarkdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Create a text file with the note content
    const element = document.createElement("a");
    const file = new Blob([`# ${noteTitle}\n\n${noteContent}`], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `${noteTitle.replace(/\s+/g, '-').toLowerCase()}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Markdown file downloaded successfully");
  };
  
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
            noteContent
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
        tryMailtoFallback();
      }
    } else {
      // Use mailto for shorter content
      tryMailtoFallback();
    }
  };
  
  const tryMailtoFallback = () => {
    try {
      // Create a mailto link with the note content
      const subject = encodeURIComponent(`Note: ${noteTitle}`);
      const body = encodeURIComponent(`${noteTitle}\n\n${noteContent}`);
      window.location.href = `mailto:?subject=${subject}&body=${body}`;
      toast.success("Email client opened");
    } catch (error) {
      toast.error("Failed to open email client");
    }
  };

  return (
    <div 
      className="absolute top-2 right-2"
      onClick={(e) => e.stopPropagation()} // Prevent card click when clicking actions
    >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground"
          >
            <MoreHorizontal className={`h-${iconSize} w-${iconSize}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="bg-white border border-mint-100 w-48">
          <DropdownMenuItem 
            className="flex items-center cursor-pointer" 
            onClick={handleAction(onPin, isPinned)}
          >
            <Pin className="mr-2 h-4 w-4" />
            <span>{isPinned ? "Unpin note" : "Pin note"}</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex items-center cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              <span>Download</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="bg-white">
              <DropdownMenuItem onClick={handleDownloadAsPDF} className="cursor-pointer">
                <FilePdf className="mr-2 h-4 w-4" />
                <span>PDF Document</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDownloadAsMarkdown} className="cursor-pointer">
                <FileText className="mr-2 h-4 w-4" />
                <span>Markdown File</span>
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          
          <DropdownMenuItem 
            className="flex items-center cursor-pointer" 
            onClick={handleEmail}
          >
            <Mail className="mr-2 h-4 w-4" />
            <span>Email</span>
          </DropdownMenuItem>
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            className="flex items-center cursor-pointer text-red-600 hover:text-red-800 focus:text-red-800" 
            onClick={handleAction(onDelete)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            <span>Delete note</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
